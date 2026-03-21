"use client";

import { useEffect, useState } from "react";
import { Settings, User, Lock, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyProfile, updateMyProfile, changePassword } from "@/lib/api";

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getMyProfile();
      const data = response.data;
      setProfile(data);
      setProfileForm({
        firstName: data.profile?.firstName || "",
        lastName: data.profile?.lastName || "",
        email: data.profile?.email || "",
        phone: data.username || "",
      });
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateMyProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      });
      await loadProfile();
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Không thể cập nhật thông tin");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(
        err.response?.data?.error || "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu cũ."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đang tải thông tin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      placeholder="Nhập họ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      placeholder="Nhập tên"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email không thể thay đổi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Số điện thoại không thể thay đổi
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={profileSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo mật tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    Đổi mật khẩu thành công!
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                    }
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordSaving}>
                    <Lock className="h-4 w-4 mr-2" />
                    {passwordSaving ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
