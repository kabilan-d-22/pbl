// server/utils/aiTools.js

const taskToolDeclaration = {
  name: "createTask",
  description: "Creates a new task and assigns it to a team member based on their name.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      description: { type: "STRING" },
      assignedToName: { type: "STRING" },
      priority: { type: "STRING", enum: ["Low", "Medium", "High"] },
      dueDate: { type: "STRING" }
    },
    required: ["title", "assignedToName", "priority"]
  }
};

// 🔥 NEW DELETE TOOL
const deleteTaskToolDeclaration = {
  name: "deleteTask",
  description: "Deletes a task using its title.",
  parameters: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING", description: "Exact title of the task to delete" }
    },
    required: ["title"]
  }
};

module.exports = { taskToolDeclaration, deleteTaskToolDeclaration };