import { Layout } from "@/components/layout";
import { useGetEntryHistory } from "@/lib/api-client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function History() {
  const { data: history, isLoading } = useGetEntryHistory();

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Queue History</h1>

        <Card>
          <CardHeader>
            <CardTitle>Past Entries</CardTitle>
            <CardDescription>A record of all the queues you've joined.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : history && history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.queue.name}</TableCell>
                      <TableCell>{entry.queue.department || "N/A"}</TableCell>
                      <TableCell>{format(new Date(entry.joinedAt), "MMM d, yyyy h:mm a")}</TableCell>
                      <TableCell>
                        {entry.completedAt
                          ? format(new Date(entry.completedAt), "h:mm a")
                          : entry.calledAt
                          ? format(new Date(entry.calledAt), "h:mm a")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === "completed"
                              ? "default"
                              : entry.status === "called"
                              ? "secondary"
                              : entry.status === "left"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No queue history found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
