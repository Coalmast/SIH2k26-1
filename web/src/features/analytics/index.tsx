import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Sparkles, Loader2, ArrowRight, BrainCircuit, Activity } from 'lucide-react'
import { RiskScoreGauge } from '@/components/shared/RiskScoreGauge'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from './components/LoadingState'
import { StreamingText } from './components/StreamingText'
import { ToolChips } from './components/ToolChips'
import { PromptBar } from './components/PromptBar'
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
  const {
    t
  } = useTranslation();

  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsTyping(true)
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '' 
      }])
      setIsTyping(false)
    }, 3000) // Simulate long thinking to show off the loader
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("ai_analytics_command_center", "AI Analytics Command Center")}</h1>
            <p className="text-muted-foreground mt-1">{t(
              "predictive_risk_modeling_and_a",
              "Predictive risk modeling and automated insights."
            )}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Visual Analytics */}
          <div className="lg:col-span-1 space-y-6">
            <RiskScoreGauge score={68} label="Aggregated Risk Level" trend="down" />
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex justify-between items-center">{t("compliance_radar", "Compliance Radar")}<Activity className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-semibold">{t("recurring_violation_clusters", "Recurring Violation Clusters")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clusterData.map(cluster => (
                    <div key={cluster.name} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">{cluster.name}</p>
                        <p className="text-xs text-muted-foreground">{cluster.count}{t("occurrences", "occurrences")}</p>
                      </div>
                      <Badge variant="outline" className={
                        cluster.risk === 'High' ? 'bg-[#f6465d]/10 text-comet-down border-[#f6465d]/30' :
                        cluster.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30'
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
            <Card className="flex-1 flex flex-col shadow-lg overflow-hidden border-border bg-background">
              <div className="bg-[#0a192f] p-4 text-foreground flex items-center gap-2 shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{t("minegpt_compliance_assistant", "MineGPT Compliance Assistant")}</h3>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/50/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
                    <div className="space-y-2">
                      <Bot className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                      <h2 className="text-xl font-bold text-foreground/80">{t("how_can_i_help_you_analyze_tod", "How can I help you analyze today?")}</h2>
                      <p className="text-sm text-muted-foreground max-w-[400px]">{t(
                        "i_have_access_to_real_time_sen",
                        "I have access to real-time sensor data, incident logs, EC conditions, and production metrics."
                      )}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[800px]">
                      {SUGGESTIONS.map((suggestion, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleSend(suggestion)}
                          className="text-left p-4 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/30 transition-all group flex justify-between items-center"
                        >
                          <span className="text-sm text-muted-foreground font-medium">{suggestion}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground shadow-sm border'}`}>
                          {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm max-w-[80%]' : 'bg-transparent w-full'}`}>
                          {msg.role === 'ai' ? (
                            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-500">
                              <ToolChips />
                              <div className="mt-4">
                                <StreamingText />
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">{msg.content}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-background text-foreground shadow-sm border flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="px-2 py-4">
                          <LoadingState variant="Drive" label="Analyzing environmental metrics..." />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-background border-t shrink-0 flex justify-center">
                <div className="w-full max-w-4xl">
                  <PromptBar tall onSend={handleSend} demo />
                  <div className="text-center mt-3">
                    <span className="text-[10px] text-muted-foreground/70">{t(
                      "minegpt_can_make_mistakes_cons",
                      "MineGPT can make mistakes. Consider verifying critical compliance information."
                    )}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
