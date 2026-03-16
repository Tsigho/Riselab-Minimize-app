import { useState } from "react";
import { Search, MoreVertical, Phone, Video, Paperclip, Mic, Send as SendIcon, CheckCheck } from "lucide-react";
import { Input, Button } from "../../../../components/ui/Primitives";
import { contacts, messages } from "./data";

export const WhatsAppInbox = () => {
    const [selectedContact, setSelectedContact] = useState(contacts[0]);
    const [msgText, setMsgText] = useState("");

    return (
        <div className="flex h-[600px] border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-border flex flex-col bg-muted/10">
                <div className="p-4 border-b border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Me&background=random" alt="Me" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-semibold text-sm">Minha Loja</span>
                        </div>
                        <div className="flex gap-2 text-muted-foreground">
                            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-foreground" />
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Pesquisar ou começar nova conversa" className="pl-9 bg-muted/50 border-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/40 ${selectedContact.id === contact.id ? 'bg-accent/50' : ''}`}
                        >
                            <div className="relative">
                                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                                {contact.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                                        {contact.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="font-medium text-sm truncate">{contact.name}</h4>
                                    <span className="text-xs text-muted-foreground">{contact.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                    {contact.id === 1 ? <CheckCheck className="w-3 h-3 text-blue-500" /> : null}
                                    {contact.lastMsg}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#efeae2]/30 relative">
                {/* Chat Header */}
                <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <h3 className="font-medium text-sm">{selectedContact.name}</h3>
                            <p className="text-xs text-muted-foreground">Online hoje às {selectedContact.time}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Video className="w-5 h-5 cursor-pointer hover:text-foreground" />
                        <Phone className="w-5 h-5 cursor-pointer hover:text-foreground" />
                        <Search className="w-5 h-5 cursor-pointer hover:text-foreground" />
                        <MoreVertical className="w-5 h-5 cursor-pointer hover:text-foreground" />
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm relative ${msg.sender === 'me' ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}>
                                <p>{msg.text}</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] text-gray-500">{msg.time}</span>
                                    {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-card border-t border-border flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground"><span className="text-xl">☺</span></Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground"><Paperclip className="w-5 h-5" /></Button>
                    <Input
                        placeholder="Mensagem"
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        className="flex-1 bg-white border-none shadow-sm"
                    />
                    {msgText ? (
                        <Button size="sm" className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full w-10 h-10 p-0 flex items-center justify-center">
                            <SendIcon className="w-5 h-5 ml-0.5" />
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="text-muted-foreground"><Mic className="w-5 h-5" /></Button>
                    )}
                </div>
            </div>
        </div>
    );
};
