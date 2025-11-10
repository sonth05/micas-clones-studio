import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Smartphone, Info } from "lucide-react";

interface PaymentInfoProps {
  paymentMethod: string;
}

const PaymentInfo = ({ paymentMethod }: PaymentInfoProps) => {
  if (paymentMethod === "cod") {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Vui lòng chuẩn bị đủ tiền để thanh toán cho shipper.
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentMethod === "bank_transfer") {
    return (
      <Card className="border-primary/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Thông tin chuyển khoản</h3>
          </div>
          
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Ngân hàng</p>
              <p className="font-semibold">Vietcombank - Chi nhánh Sài Gòn</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số tài khoản</p>
              <p className="font-semibold text-lg">1234567890</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chủ tài khoản</p>
              <p className="font-semibold">CONG TY TNHH K-SPICE</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nội dung chuyển khoản</p>
              <p className="font-semibold text-primary">KSPICE [MÃ ĐƠN HÀNG] [SỐ ĐIỆN THOẠI]</p>
            </div>
          </div>

          <div className="flex justify-center p-4 bg-white rounded-lg">
            <div className="text-center">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://kspice.com/payment" 
                alt="QR Code thanh toán" 
                className="w-48 h-48 mx-auto"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Quét mã QR để chuyển khoản nhanh
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán của bạn (thường trong vòng 5-10 phút).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (paymentMethod === "e_wallet") {
    return (
      <Card className="border-primary/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Thanh toán ví điện tử</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center hover:border-primary cursor-pointer transition-colors">
              <div className="text-4xl mb-2">💙</div>
              <p className="font-semibold">ZaloPay</p>
            </div>
            <div className="border rounded-lg p-4 text-center hover:border-primary cursor-pointer transition-colors">
              <div className="text-4xl mb-2">💗</div>
              <p className="font-semibold">Momo</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Bạn sẽ được chuyển hướng đến ứng dụng ví điện tử để hoàn tất thanh toán sau khi đặt hàng.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PaymentInfo;
