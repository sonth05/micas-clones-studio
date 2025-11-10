import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const signInSchema = z.object({
  emailOrPhone: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const signUpSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").max(100, "Họ tên quá dài"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(15, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").max(255, "Email quá dài"),
  addressLine: z.string().min(1, "Vui lòng nhập địa chỉ").max(200, "Địa chỉ quá dài"),
  city: z.string().min(1, "Vui lòng nhập thành phố").max(100, "Tên thành phố quá dài"),
  district: z.string().max(100, "Tên quận/huyện quá dài").optional(),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP phải có 6 số"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const Auth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<"signup" | "reset_password">("signup");
  const [pendingEmail, setPendingEmail] = useState("");
  const [signupData, setSignupData] = useState<any>(null);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      district: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const sendOTP = async (email: string, purpose: "signup" | "reset_password") => {
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email, purpose },
      });

      if (error) throw error;

      toast({
        title: "Mã OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
      });

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể gửi mã OTP",
      });
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string, purpose: "signup" | "reset_password") => {
    try {
      const { data, error } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("email", email)
        .eq("otp_code", otp)
        .eq("purpose", purpose)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");
      }

      // Mark OTP as verified
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", data.id);

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Xác thực OTP thất bại",
      });
      return false;
    }
  };

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      // Determine if input is email or phone
      const isEmail = values.emailOrPhone.includes("@");
      let email = values.emailOrPhone;

      // If phone number, need to look up email from profiles
      if (!isEmail) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("phone", values.emailOrPhone)
          .maybeSingle();

        if (profileError || !profiles?.email) {
          throw new Error("Không tìm thấy tài khoản với số điện thoại này");
        }
        email = profiles.email;
      }

      await signIn(email, values.password);
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });
      navigate("/");
    } catch (error: any) {
      let errorMessage = "Đăng nhập thất bại";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email/số điện thoại hoặc mật khẩu không đúng";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email chưa được xác thực";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      });
    }
  };

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", values.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error("Email đã được sử dụng");
      }

      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from("profiles")
        .select("phone")
        .eq("phone", values.phone)
        .maybeSingle();

      if (existingPhone) {
        throw new Error("Số điện thoại đã được sử dụng");
      }

      // Store signup data and send OTP
      setSignupData(values);
      setPendingEmail(values.email);
      setOtpPurpose("signup");
      
      const sent = await sendOTP(values.email, "signup");
      if (sent) {
        setShowOtpInput(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message,
      });
    }
  };

  const onVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
    try {
      const verified = await verifyOTP(pendingEmail, values.otp, otpPurpose);
      
      if (verified) {
        if (otpPurpose === "signup" && signupData) {
          // Complete signup
          await signUp(
            signupData.email,
            signupData.password,
            signupData.fullName,
            signupData.phone,
            signupData.addressLine,
            signupData.city,
            signupData.district
          );
          
          toast({
            title: "Đăng ký thành công",
            description: "Tài khoản của bạn đã được tạo và tự động đăng nhập.",
          });
          navigate("/");
        } else if (otpPurpose === "reset_password") {
          // Navigate to reset password page with verified email
          navigate("/reset-password", { state: { email: pendingEmail, verified: true } });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message,
      });
    }
  };

  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      // Check if email exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", values.email)
        .maybeSingle();

      if (!profile) {
        throw new Error("Email không tồn tại trong hệ thống");
      }

      setPendingEmail(values.email);
      setOtpPurpose("reset_password");
      
      const sent = await sendOTP(values.email, "reset_password");
      if (sent) {
        setShowOtpInput(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message,
      });
    }
  };

  const handleBackToForm = () => {
    setShowOtpInput(false);
    otpForm.reset();
  };

  if (showOtpInput) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-32 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nhập mã OTP</CardTitle>
              <CardDescription>
                Mã xác thực đã được gửi đến {pendingEmail}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel>Mã OTP (6 số)</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Button type="submit" className="w-full">
                      Xác thực
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBackToForm}
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => sendOTP(pendingEmail, otpPurpose)}
                    >
                      Gửi lại mã OTP
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-32 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chào mừng đến với K-Spice</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
                <TabsTrigger value="forgot">Quên MK</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="emailOrPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email hoặc Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com hoặc 0901234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Đăng nhập
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="0901234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="addressLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Đường ABC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signUpForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành phố</FormLabel>
                            <FormControl>
                              <Input placeholder="TP. HCM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quận/Huyện</FormLabel>
                            <FormControl>
                              <Input placeholder="Quận 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Xác nhận mật khẩu</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Đăng ký
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="forgot">
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Gửi mã OTP
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
