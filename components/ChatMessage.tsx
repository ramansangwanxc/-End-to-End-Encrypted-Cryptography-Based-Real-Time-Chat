import React from 'react';
import { format } from 'date-fns';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
  email: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  timestamp,
  isCurrentUser,
  email,
}) => {
  return (
    <div
      className={`flex ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`flex ${
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        } items-end max-w-[70%]`}
      >
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        <div
          className={`mx-2 ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
              : 'bg-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg'
          } px-4 py-2 shadow-sm`}
        >
          <div className="text-sm mb-1 font-medium">{email}</div>
          <p className="text-sm">{message}</p>
          <div className="text-xs mt-1 opacity-75">
            {format(new Date(timestamp), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
};