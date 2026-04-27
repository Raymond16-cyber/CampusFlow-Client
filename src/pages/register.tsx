import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { registerAction } from "@/store/actions/authaction";
import type { AppDispatch, RootState } from "@/store/store";

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

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "lecturer"], {
    message: "Please select a role",
  }),
  department: z.string().min(1, "Please select a department"),
  level: z.string().optional(),
  proof: z.instanceof(File, { message: "Please upload a valid file" }).refine(
    (file) =>
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type) &&
      file.size <= 10 * 1024 * 1024,
    { message: "File must be a JPG, PNG, or PDF and less than 5MB" }
  ),
}).superRefine((data, ctx) => {
  if (data.role === "student" && !data.level) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["level"],
      message: "Please select your level",
    });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  console.log("Auth state:", authState);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "student",
      department: "",
      level: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = (data: RegisterFormValues) => {
      const formData: FormData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", data.role);
      formData.append("department", data.department);

      if (data.role === "student" && data.level) {
        formData.append("level", data.level);
      }

      if (data.proof) {
        formData.append("proof", data.proof);
      }

      dispatch(registerAction(formData));
  };

  useEffect(() => {
    if (!authState.message && !authState.error) {
      return;
    }

    if (authState.error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: authState.error,
      });
      return;
    }

    if (authState.message) {
      toast({
        title: authState.requiresVerification ? "Registration submitted" : "Registration successful",
        description: authState.message,
      });
    }

    if (authState.requiresVerification) {
      setLocation("/login");
      return;
    }

    if (authState.user && authState.token) {
      login(authState.user, authState.token);
      setLocation("/dashboard");
    }
  }, [authState, login, setLocation, toast]);

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10 border">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {authState.message ? (
                    <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                      {authState.message}
                    </div>
                  ) : null}

                  {authState.error ? (
                    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                      {authState.error}
                    </div>
                  ) : null}

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="lecturer">Lecturer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="student@university.edu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dept" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedRole === "student" ? (
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Level</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LEVELS.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        Lecturer accounts require admin verification after registration.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="proof"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof of Studentship</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authState.loading}
                  >
                    {authState.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
