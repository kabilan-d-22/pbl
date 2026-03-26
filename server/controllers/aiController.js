// server/controllers/aiController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task');
const User = require('../models/User');
const Group = require('../models/Group');

const {
  taskToolDeclaration,
  deleteTaskToolDeclaration
} = require('../utils/aiTools');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;

    // =========================
    // 🔹 STEP 1: Find Group
    // =========================
    const group = await Group.findOne({ head_id: userId });

    if (!group) {
      return res.json({ answer: "You are not a group head." });
    }

    // =========================
    // 🔹 STEP 2: Get Members
    // =========================
    const teamMembers = await User.find({ group_id: group._id })
      .select('name');

    const memberNames = teamMembers.map(u => u.name).join(', ');

    // =========================
    // 🔹 STEP 3: Get Tasks
    // =========================
    const tasks = await Task.find({ assigned_by: userId })
      .populate('assigned_to', 'name');

    const taskList = tasks.length > 0
      ? tasks.map(t => {
          return `- Title: ${t.title}
  Assigned To: ${t.assigned_to?.name || "Unknown"}
  Status: ${t.status}
  Priority: ${t.priority}
  Due Date: ${t.due_date || "None"}`;
        }).join('\n\n')
      : "No tasks available";

    // =========================
    // 🔹 STEP 4: CONTEXT
    // =========================
    const context = `
You are an intelligent AI assistant for a Team Head.

=========================
TEAM MEMBERS:
${memberNames}

=========================
TASK LIST:
${taskList}

=========================
YOUR CAPABILITIES:

1. Answer ANY question about tasks
2. Show pending / completed tasks
3. Tell who tasks belong to
4. Summarize team work
5. Understand natural language queries

=========================
RULES:

- If user wants to assign a task → call "createTask"
- If user wants to delete/remove a task → call "deleteTask"
- If user asks about tasks → answer using TASK LIST
- Always respond clearly and structured
- Be smart and conversational
`;

    // =========================
    // 🔹 STEP 5: MODEL
    // =========================
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{
        functionDeclarations: [
          taskToolDeclaration,
          deleteTaskToolDeclaration
        ]
      }]
    });

    const result = await model.generateContent(
  context + "\n\nUser Question: " + prompt
);

    const response = result.response;
    const candidate = response.candidates[0];

    const functionCall = candidate.content.parts.find(
      part => part.functionCall
    );

    // =========================
    // 🔥 CREATE TASK
    // =========================
    if (functionCall && functionCall.functionCall.name === "createTask") {

      const {
        title,
        description,
        assignedToName,
        priority,
        dueDate
      } = functionCall.functionCall.args;

      const user = await User.findOne({
        name: new RegExp(`^${assignedToName}$`, 'i'),
        group_id: group._id
      });

      if (!user) {
        return res.json({
          answer: `❌ User "${assignedToName}" not found`
        });
      }

      const newTask = await Task.create({
        title,
        description: description || "",
        priority: priority || "Medium",
        status: "Pending",
        assigned_to: user._id,
        assigned_by: userId,
        due_date: dueDate || null
      });

      return res.json({
        answer: `✅ Task "${newTask.title}" assigned to ${user.name}`
      });
    }

    // =========================
    // 🔥 DELETE TASK
    // =========================
    if (functionCall && functionCall.functionCall.name === "deleteTask") {

      const { title } = functionCall.functionCall.args;

      const task = await Task.findOne({
        title: new RegExp(`^${title}$`, 'i'),
        assigned_by: userId
      });

      if (!task) {
        return res.json({
          answer: `❌ Task "${title}" not found`
        });
      }

      await Task.deleteOne({ _id: task._id });

      return res.json({
        answer: `🗑️ Task "${title}" deleted successfully`
      });
    }

    // =========================
    // 🔹 NORMAL AI RESPONSE
    // =========================
    return res.json({
      answer: response.text()
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      error: "AI Assistant failed"
    });
  }
};

module.exports = { askGemini };