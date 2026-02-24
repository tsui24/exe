import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function AnalysisPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Upload Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Active Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <FileText className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Hoso_Thau_01.pdf</p>
              <p className="text-xs text-muted-foreground">
                Bid documentation • 24 pages
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={75} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-warning/10 text-warning-foreground"
            >
              <Clock className="mr-1 h-3 w-3" />
              Processing
            </Badge>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <FileText className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">BVTC_Structure.dwg</p>
              <p className="text-xs text-muted-foreground">
                Structural drawing • AutoCAD
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-success/10 text-success"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Card */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-card p-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="destructive" className="mb-2">
                  High Priority
                </Badge>
                <p className="text-sm font-medium">
                  Fire Safety Non-Compliance
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Detected <strong>3 potential risks</strong> in Clause 4.2
                  regarding Fire Safety requirements
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                QCVN 06:2022
              </Badge>
              <Badge variant="outline" className="text-xs">
                Nghị định
              </Badge>
            </div>
            <Button variant="link" className="mt-2 h-auto p-0 text-sm">
              View detailed report
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          <div className="rounded-lg bg-card p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Structural Requirements</p>
                <p className="text-xs text-muted-foreground">
                  All structural specifications comply with TCVN 5574:2018
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-success">12</p>
              <p className="text-xs text-muted-foreground">Items Passed</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-destructive">3</p>
              <p className="text-xs text-muted-foreground">Items Flagged</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-warning-foreground">5</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-xs text-muted-foreground">Standards Checked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Standard vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Parameter</th>
                  <th className="px-3 py-2 text-left font-medium">Standard</th>
                  <th className="px-3 py-2 text-left font-medium">Actual</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2">Concrete Strength</td>
                  <td className="px-3 py-2 font-mono text-xs">≥ 30 MPa</td>
                  <td className="px-3 py-2 font-mono text-xs">32 MPa</td>
                  <td className="px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Fire Rating</td>
                  <td className="px-3 py-2 font-mono text-xs">REI 120</td>
                  <td className="px-3 py-2 font-mono text-xs">REI 90</td>
                  <td className="px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Cover Depth</td>
                  <td className="px-3 py-2 font-mono text-xs">≥ 40 mm</td>
                  <td className="px-3 py-2 font-mono text-xs">45 mm</td>
                  <td className="px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
