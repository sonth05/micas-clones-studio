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
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const Auth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [signUpData, setSignUpData] = useState<any>(null);
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
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

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      await signIn(values.email, values.password);
      navigate('/');
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const sendOTP = async (email: string) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otpCode);

    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email, otp: otpCode },
      });

      if (error) throw error;

      toast({
        title: "Mã OTP đã được gửi",
        description: "Vui lòng kiểm tra email của bạn",
      });
      
      return true;
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      toast({
        title: "Lỗi gửi OTP",
        description: "Không thể gửi mã xác thực. Vui lòng thử lại.",
        variant: "destructive",
      });
      return false;
    }
  };

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    try {
      setSignUpData(values);
      const success = await sendOTP(values.email);
      if (success) {
        setShowOTP(true);
      }
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const verifyOTP = async () => {
    if (otp !== generatedOTP) {
      toast({
        title: "Mã OTP không đúng",
        description: "Vui lòng kiểm tra lại mã OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.fullName,
        signUpData.phone,
        signUpData.addressLine,
        signUpData.city,
        signUpData.district
      );
      
      toast({
        title: "Đăng ký thành công",
        description: "Chào mừng bạn đến với K-Spice!",
      });
      navigate('/');
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await resetPassword(values.email);
      setActiveTab("signin");
    } catch (error) {
      // Error handling is done in the context
    }
  };

  if (showOTP) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-32 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Xác thực OTP</CardTitle>
              <CardDescription>
                Nhập mã OTP gồm 6 chữ số đã được gửi đến email {signUpData?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={verifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full"
                >
                  Xác thực
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendOTP(signUpData?.email)}
                  className="w-full"
                >
                  Gửi lại mã OTP
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowOTP(false);
                    setOtp("");
                    setGeneratedOTP("");
                  }}
                  className="w-full"
                >
                  Quay lại
                </Button>
              </div>
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
                      Gửi email đặt lại mật khẩu
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
