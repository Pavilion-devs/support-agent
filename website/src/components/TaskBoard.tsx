
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import TaskColumn, { Column } from './TaskColumn';
import { Task } from './TaskCard';

// Initial data for the support activity board
const initialColumns: Column[] = [
  {
    id: 'conversations',
    title: 'Conversations',
    color: 'muted',
    tasks: [
      {
        id: 't1',
        title: 'Customer asked: How do I set up SOC 2 compliance?',
        description: 'Resolved by AI in 12s',
        tag: { color: 'purple', label: 'Security' },
        dueDate: 'Just now',
        assignees: 1,
        progress: { completed: 1, total: 1 }
      },
      {
        id: 't2',
        title: 'Billing and pricing questions',
        description: 'AI provided pricing tier information',
        tag: { color: 'accent', label: 'Billing' },
        dueDate: '2 min ago',
        assignees: 1,
        progress: { completed: 1, total: 1 }
      },
      {
        id: 't3',
        title: 'API integration support request',
        description: 'Customer needs help with webhook setup',
        tag: { color: 'blue', label: 'Technical' },
        dueDate: '5 min ago',
        assignees: 1,
        progress: { completed: 1, total: 1 }
      },
      {
        id: 't4',
        title: 'Feature request: WhatsApp Business API',
        description: 'Customer wants to connect WhatsApp Business',
        tag: { color: 'purple', label: 'Feature' },
        dueDate: '10 min ago',
        assignees: 1,
        progress: { completed: 1, total: 1 }
      }
    ]
  },
  {
    id: 'escalations',
    title: 'Escalations',
    color: 'blue',
    tasks: [
      {
        id: 't5',
        title: 'Advanced vulnerability scanning inquiry',
        description: 'Escalated to Slack - needs technical expertise',
        tag: { color: 'blue', label: 'Technical' },
        dueDate: '15 min ago',
        assignees: 2,
        progress: { completed: 1, total: 3 }
      },
      {
        id: 't6',
        title: 'Custom integration requirements',
        description: 'Complex enterprise needs - escalated to sales',
        tag: { color: 'accent', label: 'Sales' },
        dueDate: '20 min ago',
        assignees: 1,
        progress: { completed: 1, total: 2 }
      },
      {
        id: 't7',
        title: 'Compliance documentation request',
        description: 'SOC 2 and GDPR compliance details needed',
        tag: { color: 'purple', label: 'Compliance' },
        dueDate: '25 min ago',
        assignees: 1,
        progress: { completed: 2, total: 4 }
      }
    ]
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    color: 'amber',
    tasks: [
      {
        id: 't8',
        title: 'Updated docs: Pricing & Billing FAQs',
        description: 'Added new pricing tier information',
        tag: { color: 'accent', label: 'Documentation' },
        dueDate: '1 hour ago',
        assignees: 1,
        progress: { completed: 4, total: 5 }
      },
      {
        id: 't9',
        title: 'API authentication guide',
        description: 'Created step-by-step authentication tutorial',
        tag: { color: 'blue', label: 'Documentation' },
        dueDate: '2 hours ago',
        assignees: 1,
        progress: { completed: 6, total: 6 }
      },
      {
        id: 't10',
        title: 'Integration setup guides',
        description: 'Updated Slack and WhatsApp setup instructions',
        tag: { color: 'purple', label: 'Documentation' },
        dueDate: '3 hours ago',
        assignees: 1,
        progress: { completed: 12, total: 12 }
      }
    ]
  },
  {
    id: 'resolved',
    title: 'Resolved',
    color: 'accent',
    tasks: [
      {
        id: 't11',
        title: 'Password reset assistance',
        description: 'Customer successfully reset their password',
        tag: { color: 'purple', label: 'Account' },
        dueDate: '1 hour ago',
        assignees: 1,
        progress: { completed: 5, total: 5 }
      },
      {
        id: 't12',
        title: 'Slack workspace connection',
        description: 'Customer connected their Slack workspace',
        tag: { color: 'blue', label: 'Integration' },
        dueDate: '2 hours ago',
        assignees: 1,
        progress: { completed: 4, total: 4 }
      },
      {
        id: 't13',
        title: 'Billing cycle explanation',
        description: 'Customer understood their billing cycle',
        tag: { color: 'accent', label: 'Billing' },
        dueDate: '3 hours ago',
        assignees: 1,
        progress: { completed: 7, total: 7 }
      }
    ]
  }
];

interface TaskBoardProps {
  className?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ className }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragSourceColumn, setDragSourceColumn] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTask(task);
    
    // Find source column
    const sourceColumn = columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );
    
    if (sourceColumn) {
      setDragSourceColumn(sourceColumn.id);
      e.dataTransfer.setData('sourceColumnId', sourceColumn.id);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setDragSourceColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Handle drag leave logic if needed
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    if (!taskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      return;
    }
    
    // Update columns state
    const newColumns = columns.map(column => {
      // Remove task from source column
      if (column.id === sourceColumnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      
      // Add task to target column
      if (column.id === targetColumnId) {
        const taskToMove = columns.find(col => col.id === sourceColumnId)?.tasks.find(task => task.id === taskId);
        if (taskToMove) {
          return {
            ...column,
            tasks: [...column.tasks, taskToMove]
          };
        }
      }
      
      return column;
    });
    
    setColumns(newColumns);
    
    // Show a toast notification
    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (targetColumn && draggedTask) {
      toast({
        title: "Support activity moved",
        description: `${draggedTask.title} moved to ${targetColumn.title}`,
      });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // This function can be used for programmatic status changes (not used in this implementation)
  };

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <TaskColumn
          key={column.id}
          column={column}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onTaskDragStart={handleTaskDragStart}
          onTaskDragEnd={handleTaskDragEnd}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
