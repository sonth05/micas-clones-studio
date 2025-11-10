import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  district: string;
  city: string;
  is_default: boolean;
}

interface AddressSelectorProps {
  onSelectAddress: (address: Address) => void;
  selectedAddressId?: string;
}

const AddressSelector = ({ onSelectAddress, selectedAddressId }: AddressSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    district: "",
    city: "",
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user?.id)
      .order("is_default", { ascending: false });

    if (data && data.length > 0) {
      setAddresses(data);
      // Auto-select default address or first address
      const defaultAddr = data.find(a => a.is_default) || data[0];
      if (!selectedAddressId) {
        onSelectAddress(defaultAddr);
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line || !newAddress.city) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      // If this is the first address, make it default
      const isFirst = addresses.length === 0;

      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user?.id,
          ...newAddress,
          is_default: isFirst,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã thêm địa chỉ mới",
      });

      setShowAddDialog(false);
      setNewAddress({
        full_name: "",
        phone: "",
        address_line: "",
        district: "",
        city: "",
      });
      
      await fetchAddresses();
      if (data) {
        onSelectAddress(data);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Địa chỉ giao hàng</Label>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm địa chỉ mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm địa chỉ giao hàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={newAddress.full_name}
                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  value={newAddress.address_line}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                  placeholder="123 Đường ABC"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thành phố</Label>
                  <Input
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quận/Huyện</Label>
                  <Input
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    placeholder="Quận 1"
                  />
                </div>
              </div>
              <Button onClick={handleAddAddress} className="w-full">
                Lưu địa chỉ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có địa chỉ giao hàng</p>
            <p className="text-sm">Vui lòng thêm địa chỉ để tiếp tục đặt hàng</p>
          </CardContent>
        </Card>
      ) : (
        <RadioGroup
          value={selectedAddressId}
          onValueChange={(value) => {
            const addr = addresses.find(a => a.id === value);
            if (addr) onSelectAddress(addr);
          }}
        >
          {addresses.map((address) => (
            <Card key={address.id} className={selectedAddressId === address.id ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                  <label htmlFor={address.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{address.full_name}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{address.phone}</span>
                      {address.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.address_line}
                      {address.district && `, ${address.district}`}
                      {`, ${address.city}`}
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      )}
    </div>
  );
};

export default AddressSelector;
