'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

// Define types for our data
interface Message { user: string; text: string; }
interface DrawingData { x: number; y: number; color: string; }

export default function ChatRoom() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { isAuthenticated, isLoading, userName } = useAuth(); // <-- Get userName from context

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Whiteboard State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#FFFFFF');

  // Main Auth and Socket Setup Effect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    // Ensure we have a user name before connecting
    if (isAuthenticated && userName) {
      const socket = io('http://localhost:8000');
      socketRef.current = socket;

      // Send both roomId and userName when joining
      socket.emit('join_room', { roomId, userName });

      // Listeners
      socket.on('receive_message', (data: Message) => setChat((prev) => [...prev, data]));
      socket.on('drawing_start', (data: DrawingData) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = data.color;
          ctx.beginPath();
          ctx.moveTo(data.x, data.y);
        }
      });
      socket.on('drawing_move', (data: DrawingData) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = data.color;
          ctx.lineTo(data.x, data.y);
          ctx.stroke();
        }
      });
      socket.on('clear_canvas', () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if(canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      return () => { socket.disconnect(); };
    }
  }, [isAuthenticated, roomId, userName]); // <-- Add userName to dependency array

  // Canvas Setup Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.lineCap = 'round';
        context.lineWidth = 5;
        contextRef.current = context;
      }
    }
  }, []);
  
  // Drawing Handlers (no changes here)
  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (contextRef.current) {
      contextRef.current.strokeStyle = penColor;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
      socketRef.current?.emit('drawing_start', { x: offsetX, y: offsetY, color: penColor, roomId });
    }
  };
  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    socketRef.current?.emit('drawing_move', { x: offsetX, y: offsetY, color: penColor, roomId });
  };
  const finishDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      socketRef.current?.emit('clear_canvas', roomId);
    }
  };

  // UPDATED handleSendMessage function
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socketRef.current && userName) {
      const messageData = {
        roomId,
        text: message,
      };
      // Send message to the server (the server will add the user name)
      socketRef.current.emit('send_message', messageData);
      
      // Add your own message to the chat with your name
      setChat((prev) => [...prev, { user: userName, text: message }]);
      setMessage('');
    }
  };
  
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 h-screen">
      <div className="mb-4">
        <Link href="/chat" className="text-orange-400 hover:underline">&larr; Back to Rooms</Link>
        <h1 className="text-2xl font-bold text-center text-brand-orange capitalize">{roomId} Study Room</h1>
      </div>
      
      <div className="flex-grow flex gap-4 overflow-hidden">
        {/* Whiteboard Area (no changes here) */}
        <div className="w-2/3 flex flex-col bg-card rounded-lg p-2">
           <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <label>Pen Color:</label>
              <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="bg-transparent" />
            </div>
            <button onClick={clearCanvas} className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700">Clear</button>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-gray-800 rounded"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
          />
        </div>

        {/* Chat Area */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-grow bg-card rounded-lg p-4 overflow-y-auto mb-4">
            <div className="space-y-4">
              {chat.map((msg, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* UPDATED logic to display names */}
                  <div className={`font-bold ${
                    msg.user === userName ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {msg.user === userName ? 'You' : msg.user}:
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 text-foreground bg-background border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button type="submit" className="px-6 py-2 font-bold text-foreground bg-orange-600 rounded-md hover:bg-orange-700">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}