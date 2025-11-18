import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ChatMessage {
  id: number;
  type: "ai" | "user";
  text: string;
}

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    type: "ai",
    text: "Hello! I'm your AI kitchen design assistant. How can I help you design your dream kitchen today?",
  },
  {
    id: 2,
    type: "user",
    text: "I want to design a kitchen with a modern look and feel.",
  },
  {
    id: 3,
    type: "ai",
    text: "Great choice! Modern kitchens often feature clean lines, minimalist cabinetry, and sleek hardware. Do you have a color palette in mind?",
  },
  {
    id: 4,
    type: "ai",
    text: "Would you prefer an island, peninsula, or an open plan layout for your kitchen?",
  },
];

export const Chat = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);

  const sendMessage = () => {
    setMessages([
      ...messages,
      { id: messages.length + 1, type: "user", text: chatInput },
    ]);
    setChatInput("");
  };

  return (
    <div className="w-full pointer-events-auto z-50">
      <div className="ux-glass rounded-xl flex flex-col h-[320px] max-h-[40vh] relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
          {chatMessages.map((message) =>
            message.type === "ai" ? (
              <div key={message.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                  </svg>
                </div>
                <div className="ux-glass p-3 rounded-lg rounded-tl-none">
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-none max-w-md">
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Input Area */}
        <div className="p-2 border-t border-border/25">
          <div className="relative flex gap-2">
            <Input
              className="ux-glass-input bg-transparent opacity-50 text-base placeholder:text-foreground"
              placeholder="Describe your dream kitchen..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              className="bg-primary text-primary-foreground hover:bg-primary/90 "
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16396755 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99721575 L3.03521743,10.4382088 C3.03521743,10.5953061 3.19218622,10.7524035 3.50612381,10.7524035 L16.6915026,11.5378905 C16.6915026,11.5378905 17.1624089,11.5378905 17.1624089,12.0091827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
