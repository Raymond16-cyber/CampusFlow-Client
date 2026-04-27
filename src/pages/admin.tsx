import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListQueues,
  useCreateQueue,
  useUpdateQueue,
  useDeleteQueue,
  useCallNextInQueue,
  useListUsers,
  useGetQueueStats,
  getListQueuesQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users, Trash2, Edit2, PlayCircle, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Arts",
  "Sciences",
  "Other",
];

const LEVELS = ["100L", "200L", "300L", "400L", "500L", "Postgraduate"];

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queues, isLoading: loadingQueues } = useListQueues();
  const { data: users, isLoading: loadingUsers } = useListUsers();
  const { data: stats } = useGetQueueStats();

  const createQueueMutation = useCreateQueue();
  const updateQueueMutation = useUpdateQueue();
  const deleteQueueMutation = useDeleteQueue();
  const callNextMutation = useCallNextInQueue();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    allowedLevel: "",
    estimatedWaitPerPerson: 5,
  });

  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    createQueueMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast({ title: "Queue created successfully" });
          setIsCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
          setFormData({
            name: "",
            description: "",
            department: "",
            allowedLevel: "",
            estimatedWaitPerPerson: 5,
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to create queue",
            description: error.error || "An error occurred.",
          });
        },
      }
    );
  };

  const handleCallNext = (id: number) => {
    callNextMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Called next student" });
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to call next",
            description: error.error || "Queue might be empty.",
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this queue?")) return;
    deleteQueueMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Queue deleted" });
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to delete",
            description: error.error || "An error occurred.",
          });
        },
      }
    );
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateQueueMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({ title: `Queue ${newStatus}` });
          queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update status",
            description: error.error || "An error occurred.",
          });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Queue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Queue</DialogTitle>
                <DialogDescription>
                  Set up a new queue for your department or office hours.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateQueue}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., CS101 Office Hours"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Department (Optional)</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(val) =>
                          setFormData({ ...formData, department: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dept" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Level Limit (Optional)</Label>
                      <Select
                        value={formData.allowedLevel}
                        onValueChange={(val) =>
                          setFormData({ ...formData, allowedLevel: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {lvl}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wait">Est. Wait Per Person (mins)</Label>
                    <Input
                      id="wait"
                      type="number"
                      required
                      min={1}
                      value={formData.estimatedWaitPerPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedWaitPerPerson: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createQueueMutation.isPending}>
                    {createQueueMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Queue
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="queues">
          <TabsList className="mb-8">
            <TabsTrigger value="queues">Manage Queues</TabsTrigger>
            <TabsTrigger value="users">Students</TabsTrigger>
            <TabsTrigger value="stats">System Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="queues">
            <Card>
              <CardHeader>
                <CardTitle>Active & Past Queues</CardTitle>
                <CardDescription>Manage all university queues</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingQueues ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dept</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Waiting</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queues?.map((queue) => (
                        <TableRow key={queue.id}>
                          <TableCell className="font-medium">
                            {queue.name}
                          </TableCell>
                          <TableCell>{queue.department || "All"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                queue.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="cursor-pointer"
                              onClick={() => handleToggleStatus(queue.id, queue.status)}
                            >
                              {queue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{queue.currentSize}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCallNext(queue.id)}
                              disabled={queue.currentSize === 0 || callNextMutation.isPending}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" /> Call Next
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(queue.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>All users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{user.level}</TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats?.map((stat) => (
                <Card key={stat.queueId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{stat.queueName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Served:</span>
                      <span className="font-medium">{stat.totalServed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Waiting:</span>
                      <span className="font-medium">{stat.currentWaiting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Wait Time:</span>
                      <span className="font-medium">{stat.avgWaitMinutes}m</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
