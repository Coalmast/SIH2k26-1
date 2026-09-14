import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Plus, GripVertical, Save, Trash2, LayoutList } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/checklist-builder')({
  component: AdminChecklistBuilderPage,
})

function AdminChecklistBuilderPage() {
  return (
    <div className="p-4 md:p-8 bg-muted/50 min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              Checklist Builder
            </h1>
            <p className="text-muted-foreground mt-1">Drag-and-drop builder for custom inspection checklists.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><LayoutList className="h-4 w-4 mr-2" /> Templates</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700"><Save className="h-4 w-4 mr-2" /> Save Checklist</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-md">Available Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Yes/No/NA Question', 'Text Input', 'Photo Evidence', 'Dropdown Select', 'Date Picker', 'Section Header'].map((item, i) => (
                  <div key={i} className="p-3 bg-background border rounded-md shadow-sm text-sm font-medium text-foreground/80 flex items-center gap-3 cursor-move hover:border-primary hover:text-primary transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/70" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader>
                <Input placeholder="Checklist Title (e.g. Pre-shift Heavy Machinery Inspection)" className="text-lg font-bold h-12 px-0 border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary" />
                <Input placeholder="Description or instructions for the inspector" className="h-8 px-0 border-0 text-muted-foreground focus-visible:ring-0 shadow-none mt-2" />
              </CardHeader>
              <CardContent className="space-y-4 min-h-[400px] bg-muted/30 p-6 rounded-b-xl border-t border-dashed">
                
                {/* Mock Item 1 */}
                <div className="bg-background p-4 rounded-lg shadow-sm border border-border flex gap-4 group">
                  <div className="cursor-move pt-2 opacity-50 hover:opacity-100"><GripVertical className="h-5 w-5" /></div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">Yes/No/NA Question</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-comet-down opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Input defaultValue="Is the backup alarm functioning correctly?" className="font-medium" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>Yes</Button>
                      <Button variant="outline" size="sm" disabled>No</Button>
                      <Button variant="outline" size="sm" disabled>N/A</Button>
                    </div>
                  </div>
                </div>

                {/* Mock Item 2 */}
                <div className="bg-background p-4 rounded-lg shadow-sm border border-border flex gap-4 group">
                  <div className="cursor-move pt-2 opacity-50 hover:opacity-100"><GripVertical className="h-5 w-5" /></div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Badge variant="secondary" className="bg-[#0ecb81]/10 text-comet-up">Photo Evidence</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-comet-down opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Input defaultValue="Upload photo of tire tread depth" className="font-medium" />
                    <div className="border-2 border-dashed border-border rounded-md p-4 text-center text-sm text-muted-foreground/70">
                      Camera Upload Zone
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground font-medium bg-muted/50">
                  Drag and drop elements here to build your checklist
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
