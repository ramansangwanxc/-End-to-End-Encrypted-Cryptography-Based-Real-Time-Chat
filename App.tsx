import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { encryptMessage, decryptMessage } from './lib/encryption';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  user_email: string;
  created_at: string;
}

function App() {
  const { user, setUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check if we're on the reset password page
    const hash = window.location.hash;
    setIsResetPassword(hash.includes('type=recovery'));

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          newMessage.content = decryptMessage(newMessage.content);
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) {
        const decryptedMessages = data.map((msg) => ({
          ...msg,
          content: decryptMessage(msg.content),
        }));
        setMessages(decryptedMessages);
      }
    };

    fetchMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleSendMessage = async (message: string) => {
    if (!user) return;

    const encryptedMessage = encryptMessage(message);
    await supabase.from('messages').insert({
      content: encryptedMessage,
      user_email: user.email,
    });
  };

  if (isResetPassword) {
    return <ResetPassword />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900">Secure Chat</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-red-600 hover:text-red-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              timestamp={message.created_at}
              isCurrentUser={message.user_email === user.email}
              email={message.user_email}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default App;