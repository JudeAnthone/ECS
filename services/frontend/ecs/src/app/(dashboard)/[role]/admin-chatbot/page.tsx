"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';
import { 
  MessageCircle,
  Send,
  User,
  Bot,
  Trash2,
  Download,
  Clock
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Extension Services Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated bot responses
  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Project-related queries
    if (lowerMessage.includes('project') && lowerMessage.includes('status')) {
      return "I can help you check project status. Currently, we have 12 active projects across all departments. 7 are completed, 4 are ongoing, and 1 is delayed. Would you like details about a specific project?";
    }
    if (lowerMessage.includes('project') && (lowerMessage.includes('create') || lowerMessage.includes('new'))) {
      return "To create a new project, you'll need to provide: Project Name, Department, Assigned Personnel, Budget, and Deadline. You can access the Project Management section from the main menu to create a new project.";
    }
    if (lowerMessage.includes('project') && lowerMessage.includes('budget')) {
      return "Our current total project budget allocation is $2,500,000 with $1,850,000 spent (74% utilization). The remaining budget is $650,000. Would you like a breakdown by department?";
    }

    // User management queries
    if (lowerMessage.includes('user') && (lowerMessage.includes('add') || lowerMessage.includes('create'))) {
      return "To add a new user, navigate to User Management and click 'Add User'. You'll need to provide: Full Name, Email, Department, Role, and initial password. The user will receive an email to set up their account.";
    }
    if (lowerMessage.includes('user') && lowerMessage.includes('reset')) {
      return "To reset a user's password, go to User Management, find the user, click the three-dot menu, and select 'Reset Password'. The user will receive an email with password reset instructions.";
    }

    // Budget queries
    if (lowerMessage.includes('budget') && lowerMessage.includes('department')) {
      return "Here's the budget breakdown by department:\n• Engineering: $850,000 (75% utilized)\n• Marketing: $620,000 (78% utilized)\n• Research: $580,000 (73% utilized)\n• Operations: $720,000 (82% utilized)";
    }

    // Analytics queries
    if (lowerMessage.includes('analytic') || lowerMessage.includes('report')) {
      return "You can access detailed analytics in the Analytics Dashboard. You can filter by department, select analytics type (Funds, Projects, or Services), and choose any date range. The reports can be printed or downloaded for your records.";
    }

    // Help queries
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I can help you with:\n• Project information and status\n• User management\n• Budget and fund queries\n• Analytics and reports\n• General system navigation\n\nWhat would you like to know more about?";
    }

    // Department queries
    if (lowerMessage.includes('department')) {
      return "We have 4 main departments:\n• Engineering (12 personnel)\n• Marketing (8 personnel)\n• Research (6 personnel)\n• Operations (10 personnel)\n\nWhich department would you like to know more about?";
    }

    // Task queries
    if (lowerMessage.includes('task') && lowerMessage.includes('assign')) {
      return "To assign a task, go to your Dashboard and click 'Add Task'. Enter the task title, select the assignee, set the due date, and add any relevant details. The assignee will be notified immediately.";
    }

    // Services queries
    if (lowerMessage.includes('service') && lowerMessage.includes('request')) {
      return "To request a service, submit a service request form specifying the service type, priority level, and detailed requirements. Current average response time is 2.4 hours, and we maintain a 92% on-time delivery rate.";
    }

    // Blog queries
    if (lowerMessage.includes('blog') || lowerMessage.includes('announcement')) {
      return "Check the Blog section for the latest announcements and updates. Recent posts include information about new features, policy changes, and departmental highlights. You can also subscribe to email notifications for new posts.";
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I assist you today? Feel free to ask me about projects, budgets, users, analytics, or any other aspect of the Extension Services system.";
    }

    // Thank you responses
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    // Default response
    return "I understand you're asking about: \"" + userMessage + "\". Could you please provide more details? I can help with projects, users, budgets, analytics, tasks, services, and general system information.";
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your Extension Services Assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleDownloadChat = () => {
    const chatContent = messages.map(msg => {
      const time = msg.timestamp.toLocaleTimeString();
      const sender = msg.sender === 'user' ? 'You' : 'Assistant';
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .message-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: #64748b;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              AI Assistant
            </h1>
            <p className="text-slate-600 text-lg">Get instant help with your queries</p>
          </div>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat Support
          </Badge>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 text-xl">Extension Services Assistant</CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        Online • Ready to help
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadChat}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearChat}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages Area */}
                <ScrollArea className="h-[500px] p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 message-slide-in ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-3 ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        </div>

                        {message.sender === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3 justify-start message-slide-in">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-lg px-4 py-3">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-white border-slate-300 text-slate-900"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isTyping || inputMessage.trim() === ''}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Questions */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Quick Questions</CardTitle>
                <CardDescription className="text-slate-600">
                  Click to ask common questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("What's the current project status?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  What&apos;s the current project status?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("Show me budget breakdown by department");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Budget breakdown by department
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("How do I add a new user?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  How do I add a new user?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("How do I create a new project?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  How do I create a new project?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("Where can I access analytics?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Where can I access analytics?
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => {
                    setInputMessage("How do I assign a task?");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  How do I assign a task?
                </Button>
              </CardContent>
            </Card>

            {/* Chat Info */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Chat Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Messages:</span>
                  <span className="font-semibold text-slate-900">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Response Time:</span>
                  <span className="font-semibold text-slate-900">~1-2s</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Topics */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">I can help with:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Project information and status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>User management queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Budget and fund information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Analytics and reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Task assignment and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Service requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>System navigation help</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}