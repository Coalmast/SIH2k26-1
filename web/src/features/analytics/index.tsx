import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Sparkles, Loader2, ArrowRight, BrainCircuit, Activity } from 'lucide-react'
import { RiskScoreGauge } from '@/components/shared/RiskScoreGauge'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Badge } from '@/components/ui/badge'

const SUGGESTIONS = [
  "Analyze Q3 safety trends across all opencast mines.",
  "What is the correlation between PM10 levels and recent incidents?",
  "Forecast EC compliance risk for next month.",
  "Compare production vs safety metrics for Pit 3 East."
]

const radarData = [
  { subject: 'Safety', A: 85, fullMark: 100 },
  { subject: 'Environment', A: 65, fullMark: 100 },
  { subject: 'Production', A: 90, fullMark: 100 },
  { subject: 'Labour', A: 75, fullMark: 100 },
  { subject: 'Machinery', A: 80, fullMark: 100 },
]

const clusterData = [
  { name: 'Ventilation', count: 12, risk: 'High' },
  { name: 'Dust', count: 8, risk: 'Medium' },
  { name: 'PPE', count: 15, risk: 'Low' },
  { name: 'Machinery', count: 5, risk: 'High' },
]

export function AIAnalyticsModule() {
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string = input) => {
    if (!text.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setIsTyping(true)
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `**Analysis Result**\n\nBased on your query regarding "${text}", I have analyzed the telemetry and incident logs.\n\n- **Finding 1:** There is a 42% spike in dust-related anomalies just before shift changes.\n- **Finding 2:** Incident rate correlates heavily with these peaks.\n\n**Recommendation:** Implement automated mist cannons synchronized with shift timings.` 
      }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Analytics Command Center</h1>
            <p className="text-muted-foreground mt-1">Predictive risk modeling and automated insights.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Visual Analytics */}
          <div className="lg:col-span-1 space-y-6">
            <RiskScoreGauge score={68} label="Aggregated Risk Level" trend="down" />
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex justify-between items-center">
                  Compliance Radar
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] p-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Radar name="Mine A" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Recurring Violation Clusters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clusterData.map(cluster => (
                    <div key={cluster.name} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{cluster.name}</p>
                        <p className="text-xs text-slate-500">{cluster.count} occurrences</p>
                      </div>
                      <Badge variant="outline" className={
                        cluster.risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                        cluster.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }>
                        {cluster.risk}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: MineGPT Chat */}
          <div className="lg:col-span-3 h-[calc(100vh-140px)] min-h-[600px] flex flex-col">
            <Card className="flex-1 flex flex-col shadow-lg overflow-hidden border-slate-200 bg-white">
              <div className="bg-[#0a192f] p-4 text-white flex items-center gap-2 shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">MineGPT Compliance Assistant</h3>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
                    <div className="space-y-2">
                      <Bot className="h-16 w-16 text-slate-300 mx-auto" />
                      <h2 className="text-xl font-bold text-slate-700">How can I help you analyze today?</h2>
                      <p className="text-sm text-slate-500 max-w-[400px]">I have access to real-time sensor data, incident logs, EC conditions, and production metrics.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[800px]">
                      {SUGGESTIONS.map((suggestion, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleSend(suggestion)}
                          className="text-left p-4 rounded-xl border bg-white hover:bg-primary/5 hover:border-primary/30 transition-all group flex justify-between items-center"
                        >
                          <span className="text-sm text-slate-600 font-medium">{suggestion}</span>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-slate-900 text-slate-50'}`}>
                          {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-white border shadow-sm rounded-tl-sm'}`}>
                          {msg.role === 'ai' ? (
                            <div className="text-sm prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          ) : (
                            <div className="text-sm">{msg.content}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-slate-50 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-slate-500 font-medium">Analyzing multidimensional data...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-white border-t shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      value={input} 
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask about compliance, incidents, or trends..." 
                      className="pr-12 py-6 rounded-xl border-slate-300 focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                  <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-[50px] w-[50px] rounded-xl shrink-0">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-slate-400">MineGPT can make mistakes. Consider verifying critical compliance information.</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
