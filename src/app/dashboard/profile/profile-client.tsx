"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, User, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyProfile, updateMyProfile, changePassword } from "@/lib/api";
import type { MyProfileData } from "@/types";
import { cn } from "@/lib/utils";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  gender: string;
  dateOfBirth: string;
};

type ProfileFormErrors = Partial<Record<"firstName" | "lastName" | "dateOfBirth", string>>;

type PasswordFormState = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>> & {
  general?: string;
};

type PasswordVisibilityState = Record<keyof PasswordFormState, boolean>;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_AVATAR_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;

  const maybeAxiosError = error as {
    response?: {
      data?: {
        error?: string;
        message?: string;
        detail?: string;
      };
    };
    message?: string;
  };

  return (
    maybeAxiosError.response?.data?.error ||
    maybeAxiosError.response?.data?.message ||
    maybeAxiosError.response?.data?.detail ||
    maybeAxiosError.message ||
    fallback
  );
}

function mergeProfileData(raw: MyProfileData): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  const topLevel = raw as Record<string, unknown>;

  for (const [key, value] of Object.entries(topLevel)) {
    if (key !== "profile") merged[key] = value;
  }

  const profile = topLevel.profile;
  if (isRecord(profile)) {
    for (const [key, value] of Object.entries(profile)) {
      merged[key] = value;
    }
  }

  return merged;
}

function pickStringValue(source: Record<string, unknown>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = source[alias];
    if (typeof value === "string") return value;
  }
  return "";
}

function pickDateValue(source: Record<string, unknown>, aliases: string[]): string {
  const raw = pickStringValue(source, aliases);
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeGender(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  if (["male", "nam"].includes(normalized)) return "male";
  if (["female", "nu", "nữ"].includes(normalized)) return "female";
  if (["other", "khac", "khác"].includes(normalized)) return "other";
  return "";
}

function mapGenderToPayload(value: string): string | undefined {
  if (value === "male") return "Male";
  if (value === "female") return "Female";
  if (value === "other") return "Other";
  return undefined;
}

function getBirthDateMax(): string {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, "0");
  const day = String(maxDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function emitProfileAvatarUpdated(avatarUrl: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("profile-avatar-updated", {
      detail: { avatarUrl },
    }),
  );
}

export default function ProfileClientPage() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    gender: "",
    dateOfBirth: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadError("");

    try {
      const response = await getMyProfile();
      const data = response.data;
      const merged = mergeProfileData(data);
      const fallbackPhone = pickStringValue(merged, ["phone"]) || pickStringValue(merged, ["username"]);

      setProfileForm({
        firstName: pickStringValue(merged, ["firstName", "first_name"]),
        lastName: pickStringValue(merged, ["lastName", "last_name"]),
        email: pickStringValue(merged, ["email"]),
        phone: fallbackPhone,
        avatarUrl: pickStringValue(merged, ["avatarUrl", "avatar_url"]),
        gender: normalizeGender(pickStringValue(merged, ["gender", "sex"])),
        dateOfBirth: pickDateValue(merged, ["dateOfBirth", "date_of_birth", "birthDate", "dob"]),
      });
      emitProfileAvatarUpdated(pickStringValue(merged, ["avatarUrl", "avatar_url"]));
    } catch (err) {
      console.error("Error loading profile:", err);
      setLoadError(getErrorMessage(err, "Không thể tải thông tin hồ sơ."));
    } finally {
      setLoading(false);
    }
  };

  const validateProfileForm = (): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = "Vui lòng nhập họ.";
    }

    if (!profileForm.lastName.trim()) {
      errors.lastName = "Vui lòng nhập tên.";
    }

    if (profileForm.dateOfBirth) {
      const selectedDate = new Date(profileForm.dateOfBirth);
      const maxAllowedDate = new Date(birthDateMax);

      if (Number.isNaN(selectedDate.getTime())) {
        errors.dateOfBirth = "Ngày sinh không hợp lệ.";
      } else if (selectedDate > maxAllowedDate) {
        errors.dateOfBirth = "Bạn phải đủ 15 tuổi trở lên.";
      }
    }

    return errors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    const nextErrors = validateProfileForm();
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setProfileSaving(true);
    try {
      await updateMyProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        avatarUrl: profileForm.avatarUrl.trim() || undefined,
        gender: mapGenderToPayload(profileForm.gender),
        dateOfBirth: profileForm.dateOfBirth || undefined,
      });
      await loadProfile();
      setProfileFeedback({
        type: "success",
        message: "Cập nhật thông tin thành công.",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileFeedback({
        type: "error",
        message: getErrorMessage(err, "Không thể cập nhật thông tin."),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const validatePasswordForm = (): PasswordFormErrors => {
    const errors: PasswordFormErrors = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return errors;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");

    const nextErrors = validatePasswordForm();
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
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
      setPasswordErrors({});
      setPasswordSuccess("Đổi mật khẩu thành công.");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordErrors({
        general: getErrorMessage(err, "Không thể đổi mật khẩu. Vui lòng thử lại."),
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleProfileFieldChange =
    (field: "firstName" | "lastName") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setProfileForm((prev) => ({ ...prev, [field]: value }));
      setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarUploadError("Chỉ chấp nhận ảnh PNG, JPG, WebP, SVG hoặc GIF.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarUploadError("Ảnh quá lớn (tối đa 2 MB).");
      return;
    }

    setAvatarUploadError("");
    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
      throw new Error(data.error ?? "Tải ảnh lên thất bại.");
      }

      emitProfileAvatarUpdated(data.url);
      setProfileForm((prev) => ({ ...prev, avatarUrl: data.url }));
    } catch (err) {
      setAvatarUploadError(getErrorMessage(err, "Không thể tải ảnh lên."));
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handlePasswordFieldChange =
    (field: keyof PasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPasswordForm((prev) => ({ ...prev, [field]: value }));

      setPasswordErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

  const handlePasswordFieldBlur = (field: keyof PasswordFormState) => () => {
    if (field === "newPassword" || field === "confirmPassword") {
      if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmPassword: "Mật khẩu xác nhận không khớp.",
        }));
      } else {
        setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    };
  };

  const togglePasswordVisibility = (field: keyof PasswordFormState) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const avatarFallback = `${profileForm.firstName.charAt(0)}${profileForm.lastName.charAt(0)}`
    .trim()
    .toUpperCase() || "U";
  const birthDateMax = getBirthDateMax();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thông tin cá nhân</h1>
          <p className="mt-1 text-sm text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Thông tin cá nhân
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản
        </p>
      </div>

      {loadError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

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
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {profileFeedback && (
                  <div
                    className={cn(
                      "rounded-md border px-4 py-3 text-sm",
                      profileFeedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-destructive/30 bg-destructive/10 text-destructive",
                    )}
                  >
                    {profileFeedback.message}
                  </div>
                )}

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    className="relative mx-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={profileSaving || avatarUploading}
                    aria-label="Tải lên ảnh đại diện"
                  >
                    <Avatar className="h-24 w-24 border" key={profileForm.avatarUrl || "avatar-empty"}>
                      <AvatarImage src={profileForm.avatarUrl} alt="Ảnh đại diện" />
                      <AvatarFallback className="text-lg font-semibold">{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="absolute inset-0 flex items-end justify-center rounded-full pb-2 text-xs text-white">
                      <span className="rounded-full bg-black/45 px-2 py-0.5 backdrop-blur-sm">
                        {avatarUploading ? "Đang tải..." : "Đổi ảnh"}
                      </span>
                    </span>
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  {avatarUploadError && <p className="text-xs text-destructive">{avatarUploadError}</p>}
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileFieldChange("firstName")}
                      placeholder="Nhập họ"
                      className={cn(
                        profileErrors.firstName && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {profileErrors.firstName && (
                      <p className="text-xs text-destructive">{profileErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profileForm.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileFieldChange("lastName")}
                      placeholder="Nhập tên"
                      className={cn(
                        profileErrors.lastName && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {profileErrors.lastName && (
                      <p className="text-xs text-destructive">{profileErrors.lastName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" value={profileForm.phone} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Số điện thoại không thể thay đổi</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileForm.dateOfBirth}
                      max={birthDateMax}
                      onChange={(e) => {
                        setProfileForm((prev) => ({ ...prev, dateOfBirth: e.target.value }));
                        setProfileErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
                      }}
                    />
                    {profileErrors.dateOfBirth && (
                      <p className="text-xs text-destructive">{profileErrors.dateOfBirth}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select
                      value={profileForm.gender}
                      onValueChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger id="gender" className="w-full">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={profileSaving}>
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
              <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordErrors.general && (
                  <div className="rounded border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {passwordErrors.general}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={passwordVisibility.oldPassword ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordFieldChange("oldPassword")}
                      onBlur={handlePasswordFieldBlur("oldPassword")}
                      autoComplete="current-password"
                      className={cn(
                        "pr-10",
                        passwordErrors.oldPassword && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility("oldPassword")}
                      aria-label={passwordVisibility.oldPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                    >
                      {passwordVisibility.oldPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.oldPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={passwordVisibility.newPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordFieldChange("newPassword")}
                      onBlur={handlePasswordFieldBlur("newPassword")}
                      autoComplete="new-password"
                      className={cn(
                        "pr-10",
                        passwordErrors.newPassword && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility("newPassword")}
                      aria-label={passwordVisibility.newPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                    >
                      {passwordVisibility.newPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.newPassword ? (
                    <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={passwordVisibility.confirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordFieldChange("confirmPassword")}
                      onBlur={handlePasswordFieldBlur("confirmPassword")}
                      autoComplete="new-password"
                      className={cn(
                        "pr-10",
                        passwordErrors.confirmPassword &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                      aria-label={
                        passwordVisibility.confirmPassword
                          ? "Ẩn mật khẩu xác nhận"
                          : "Hiện mật khẩu xác nhận"
                      }
                    >
                      {passwordVisibility.confirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordSaving}>
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
