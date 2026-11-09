"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ADMIN_USERNAME, STORAGE_KEYS, TEMPEKAN_LIST } from "@/lib/constants";
import {
  findMemberForAuth,
  memberCode,
  nextMemberSequence,
  todayInput,
  uid,
} from "@/lib/utils";
import type {
  AttendanceSession,
  AttendanceStatus,
  AuthUser,
  Member,
  MemberInput,
  Role,
  ToastMessage,
  UserAccount,
} from "@/lib/types";
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from "@/lib/supabase";
import {
  deleteMemberRecord,
  fetchMembersFromDb,
  fetchUserByUsername,
  insertMember,
  insertUser,
  updateMemberProfile,
  updateMemberRecord,
  updateUserProfile,
  uploadProfilePhoto,
  usernameExists,
  usernameTakenByOther,
} from "@/lib/supabaseData";
import {
  readStorage,
  useLocalStorageState,
} from "@/hooks/useLocalStorageState";

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AppContextValue {
  auth: AuthUser | null;
  hydrated: boolean;
  login: (
    username: string,
    role: Role,
    password?: string,
  ) => Promise<LoginResult>;
  registerAccount: (input: {
    username: string;
    password: string;
    photo?: string;
    photoName?: string;
  }) => Promise<LoginResult>;
  logout: () => void;
  updateProfile: (input: {
    username: string;
    photoDataUrl?: string;
    photoName?: string;
    removePhoto?: boolean;
  }) => Promise<LoginResult>;

  members: Member[];
  addMember: (input: MemberInput) => Promise<Member | null>;
  updateMember: (id: string, input: MemberInput) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  registeredMember: Member | undefined;
  isRegistered: boolean;

  sessions: AttendanceSession[];
  createSession: (input: {
    nama: string;
    tanggal: string;
    denda: number;
  }) => AttendanceSession | null;
  deleteSession: (id: string) => void;
  setAttendance: (
    sessionId: string,
    memberId: string,
    status: AttendanceStatus,
  ) => void;

  online: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  lastSyncedAt: string;

  toasts: ToastMessage[];
  pushToast: (
    type: ToastMessage["type"],
    title: string,
    description?: string,
  ) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function syncedTime(): string {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth, authHydrated] = useLocalStorageState<AuthUser | null>(
    STORAGE_KEYS.auth,
    null,
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [sessions, setSessions, sessionsHydrated] = useLocalStorageState<
    AttendanceSession[]
  >(STORAGE_KEYS.sessions, []);

  const [bootstrapped, setBootstrapped] = useState(false);
  const [online, setOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const registrationLock = useRef(false);
  const authRef = useRef(auth);

  const hydrated = authHydrated && sessionsHydrated && bootstrapped;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (type: ToastMessage["type"], title: string, description?: string) => {
      const id = uid("toast");
      setToasts((prev) => [...prev.slice(-2), { id, type, title, description }]);
      timers.current[id] = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        delete timers.current[id];
      }, 4200);
    },
    [],
  );

  const reportSupabaseError = useCallback(
    (context: string, error: unknown) => {
      const message = errorText(error);
      window.alert(`${context}: ${message}`);
      pushToast("error", context, message);
      return message;
    },
    [pushToast],
  );

  const loadMembers = useCallback(async (): Promise<Member[]> => {
    const data = await fetchMembersFromDb();
    setMembers(data);
    setLastSyncedAt(syncedTime());
    return data;
  }, []);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => {
      setOnline(true);
      pushToast("success", "Koneksi pulih", "Perangkat kembali terhubung.");
    };
    const goOffline = () => {
      setOnline(false);
      pushToast("error", "Koneksi terputus", "Periksa jaringan internet Anda.");
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [pushToast]);

  // Restore the saved auth session only after verifying it against Supabase,
  // then load every member row from the database.
  useEffect(() => {
    if (!authHydrated) return;
    let cancelled = false;

    const bootstrap = async () => {
      try {
        if (!isSupabaseConfigured) throw new Error(SUPABASE_CONFIG_ERROR);

        const dbMembers = await fetchMembersFromDb();
        if (cancelled) return;
        setMembers(dbMembers);
        setLastSyncedAt(syncedTime());

        const currentAuth = authRef.current;
        if (currentAuth?.username) {
          const dbUser = await fetchUserByUsername(currentAuth.username);
          if (cancelled) return;
          if (!dbUser) {
            setAuth(null);
          } else {
            setAuth({
              userId: dbUser.id,
              username: dbUser.username,
              name: dbUser.username,
              role: dbUser.role,
              photo: dbUser.photo,
              loginAt: currentAuth.loginAt || new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = errorText(error);
          pushToast("error", "Gagal terhubung ke Supabase", message);
        }
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, pushToast, setAuth]);

  // Keep attendance sessions in sync between tabs while auth and members
  // always come from Supabase.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.sessions) {
        setSessions(readStorage<AttendanceSession[]>(STORAGE_KEYS.sessions, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setSessions]);

  const login = useCallback(
    async (
      username: string,
      role: Role,
      password?: string,
    ): Promise<LoginResult> => {
      const identifier = username.trim().toLowerCase();
      if (!identifier || !password) {
        return {
          ok: false,
          error: "Username dan password wajib diisi.",
        };
      }

      try {
        const user = await fetchUserByUsername(identifier);
        if (!user || user.password !== password) {
          return {
            ok: false,
            error: "Username atau password salah.",
          };
        }
        if (role === "ADMIN" && user.role !== "ADMIN") {
          return {
            ok: false,
            error: "Akun ini tidak memiliki akses Admin.",
          };
        }
        if (role === "PENGGUNA" && user.role === "ADMIN") {
          return {
            ok: false,
            error: "Akun Admin harus masuk melalui tab Admin.",
          };
        }

        setAuth({
          userId: user.id,
          username: user.username,
          name: user.username,
          role: user.role,
          photo: user.photo,
          loginAt: new Date().toISOString(),
        });

        try {
          await loadMembers();
        } catch (error) {
          reportSupabaseError("Gagal mengambil data anggota dari Supabase", error);
        }
        return { ok: true };
      } catch (error) {
        throw error instanceof Error ? error : new Error(errorText(error));
      }
    },
    [loadMembers, reportSupabaseError, setAuth],
  );

  const registerAccount = useCallback(
    async (input: {
      username: string;
      password: string;
      photo?: string;
      photoName?: string;
    }): Promise<LoginResult> => {
      const username = input.username.trim().toLowerCase();
      if (username.length < 3) {
        return {
          ok: false,
          error: "Username minimal 3 karakter.",
        };
      }
      if (username.length > 24) {
        return {
          ok: false,
          error: "Username maksimal 24 karakter.",
        };
      }
      if (/\s/.test(username)) {
        return {
          ok: false,
          error: "Username tidak boleh mengandung spasi.",
        };
      }
      if (input.password.length < 6) {
        return {
          ok: false,
          error: "Password minimal 6 karakter.",
        };
      }

      try {
        const taken = await usernameExists(username);
        if (taken || username === ADMIN_USERNAME) {
          return {
            ok: false,
            error: "Username sudah digunakan. Pilih username lain.",
          };
        }

        let photoUrl: string | undefined;
        if (input.photo) {
          try {
            photoUrl = await uploadProfilePhoto(
              input.photo,
              username,
              input.photoName,
            );
          } catch (error) {
            throw new Error(`Gagal upload foto: ${errorText(error)}`);
          }
        }

        let account: UserAccount;
        try {
          account = await insertUser({
            username,
            password: input.password,
            photoUrl,
          });
        } catch (error) {
          throw new Error(errorText(error));
        }

        setAuth({
          userId: account.id,
          username: account.username,
          name: account.username,
          role: "PENGGUNA",
          photo: account.photo,
          loginAt: new Date().toISOString(),
        });

        try {
          await loadMembers();
        } catch (error) {
          reportSupabaseError("Gagal mengambil data anggota dari Supabase", error);
        }
        return { ok: true };
      } catch (error) {
        throw error instanceof Error ? error : new Error(errorText(error));
      }
    },
    [loadMembers, reportSupabaseError, setAuth],
  );

  const logout = useCallback(() => {
    setAuth(null);
    setMembers([]);
    pushToast("info", "Anda telah keluar", "Sesi login berhasil diakhiri.");
  }, [pushToast, setAuth]);

  const updateProfile = useCallback(
    async (input: {
      username: string;
      photoDataUrl?: string;
      photoName?: string;
      removePhoto?: boolean;
    }): Promise<LoginResult> => {
      if (!auth) {
        return { ok: false, error: "Sesi tidak ditemukan. Silakan login ulang." };
      }
      if (!auth.userId) {
        return {
          ok: false,
          error: "Akun ini belum memiliki ID yang valid. Silakan login ulang.",
        };
      }

      const newUsername = input.username.trim().toLowerCase();
      if (newUsername.length < 3) {
        return { ok: false, error: "Username minimal 3 karakter." };
      }
      if (newUsername.length > 24) {
        return { ok: false, error: "Username maksimal 24 karakter." };
      }
      if (/\s/.test(newUsername)) {
        return { ok: false, error: "Username tidak boleh mengandung spasi." };
      }

      const currentUsername = auth.username.trim().toLowerCase();
      const usernameChanged = newUsername !== currentUsername;

      try {
        if (
          usernameChanged &&
          (newUsername === ADMIN_USERNAME ||
            (await usernameTakenByOther(newUsername, auth.userId)))
        ) {
          return {
            ok: false,
            error: "Username sudah digunakan. Pilih username lain.",
          };
        }

        let photoUrl: string | null | undefined;
        if (input.removePhoto) {
          photoUrl = null;
        }
        if (input.photoDataUrl) {
          try {
            photoUrl = await uploadProfilePhoto(
              input.photoDataUrl,
              newUsername,
              input.photoName,
            );
          } catch (error) {
            return { ok: false, error: `Gagal upload foto: ${errorText(error)}` };
          }
        }

        const pictureChanged = photoUrl !== undefined;

        await updateUserProfile({
          userId: auth.userId ?? "",
          username: usernameChanged ? newUsername : undefined,
          photoUrl: pictureChanged ? photoUrl ?? null : undefined,
        });

        const linkedMember = findMemberForAuth(members, auth);
        let updatedMember: Member | undefined;
        if (linkedMember) {
          updatedMember = await updateMemberProfile(linkedMember.id, {
            username: usernameChanged ? newUsername : undefined,
            profilePicture: pictureChanged ? photoUrl ?? null : undefined,
          });
        }

        setAuth((prev) =>
          prev
            ? {
                ...prev,
                username: usernameChanged ? newUsername : prev.username,
                name: usernameChanged ? newUsername : prev.name,
                photo: pictureChanged ? photoUrl ?? undefined : prev.photo,
              }
            : prev,
        );

        if (updatedMember) {
          const next = updatedMember;
          setMembers((prev) =>
            prev.map((member) => (member.id === next.id ? next : member)),
          );
        } else if (usernameChanged) {
          setMembers((prev) =>
            prev.map((member) =>
              member.userId && member.userId === auth.userId
                ? { ...member, username: newUsername }
                : member,
            ),
          );
        }

        setLastSyncedAt(syncedTime());
        pushToast(
          "success",
          "Profil berhasil diperbarui!",
          "Perubahan username dan foto berhasil disimpan.",
        );
        return { ok: true };
      } catch (error) {
        const message = errorText(error);
        pushToast("error", "Gagal memperbarui profil", message);
        return { ok: false, error: message };
      }
    },
    [auth, members, pushToast, setAuth],
  );

  const addMember = useCallback(
    async (input: MemberInput): Promise<Member | null> => {
      if (!auth) {
        pushToast("error", "Sesi tidak ditemukan", "Silakan login ulang.");
        return null;
      }

      const linkedMember = findMemberForAuth(members, auth);

      if (auth.role === "PENGGUNA") {
        if (linkedMember) {
          pushToast(
            "error",
            "Registrasi tidak dapat diulang",
            "Satu akun pengguna hanya boleh mendaftarkan satu data anggota.",
          );
          return null;
        }
        if (registrationLock.current) return null;
        registrationLock.current = true;
        window.setTimeout(() => {
          registrationLock.current = false;
        }, 0);
      }

      const id = memberCode(nextMemberSequence(members.map((m) => m.id)));

      try {
        const created = await insertMember({
          id,
          userId: auth.role === "PENGGUNA" ? auth.userId : undefined,
          username: auth.role === "PENGGUNA" ? auth.username : undefined,
          data: {
            nama: input.nama.trim(),
            alamat: input.alamat.trim(),
            whatsapp: input.whatsapp.trim(),
            tempekan: TEMPEKAN_LIST.includes(input.tempekan)
              ? input.tempekan
              : TEMPEKAN_LIST[0],
            status: input.status,
            usia: input.usia,
          },
        });

        setMembers((prev) => [...prev, created]);
        setLastSyncedAt(syncedTime());
        return created;
      } catch (error) {
        reportSupabaseError("Gagal menyimpan ke Supabase", error);
        return null;
      } finally {
        if (auth.role === "PENGGUNA") {
          window.setTimeout(() => {
            registrationLock.current = false;
          }, 0);
        }
      }
    },
    [auth, members, pushToast, reportSupabaseError],
  );

  const updateMember = useCallback(
    async (id: string, input: MemberInput): Promise<boolean> => {
      try {
        const updated = await updateMemberRecord(id, {
          nama: input.nama.trim(),
          alamat: input.alamat.trim(),
          whatsapp: input.whatsapp.trim(),
          tempekan: input.tempekan,
          status: input.status,
          usia: input.usia,
        });
        setMembers((prev) =>
          prev.map((member) => (member.id === id ? updated : member)),
        );
        setLastSyncedAt(syncedTime());
        return true;
      } catch (error) {
        reportSupabaseError("Gagal memperbarui data di Supabase", error);
        return false;
      }
    },
    [reportSupabaseError],
  );

  const deleteMember = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMemberRecord(id);
        setMembers((prev) => prev.filter((member) => member.id !== id));
        setSessions((prev) =>
          prev.map((session) => {
            if (!(id in session.records)) return session;
            const records = { ...session.records };
            delete records[id];
            return { ...session, records };
          }),
        );
        setLastSyncedAt(syncedTime());
        return true;
      } catch (error) {
        reportSupabaseError("Gagal menghapus data dari Supabase", error);
        return false;
      }
    },
    [reportSupabaseError, setSessions],
  );

  const createSession = useCallback(
    (input: { nama: string; tanggal: string; denda: number }) => {
      if (!input.nama.trim() || !input.tanggal) return null;
      const records: Record<string, AttendanceStatus> = {};
      members.forEach((member) => {
        // New members start as ALPHA until the admin marks attendance or scans a KTA.
        records[member.id] = "ALPHA";
      });
      const session: AttendanceSession = {
        id: uid("session"),
        nama: input.nama.trim(),
        tanggal: input.tanggal || todayInput(),
        denda: Number.isFinite(input.denda) ? input.denda : 0,
        createdAt: new Date().toISOString(),
        records,
      };
      setSessions((prev) => [session, ...prev]);
      return session;
    },
    [members, setSessions],
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((session) => session.id !== id));
    },
    [setSessions],
  );

  const setAttendance = useCallback(
    (sessionId: string, memberId: string, status: AttendanceStatus) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                records: { ...session.records, [memberId]: status },
              }
            : session,
        ),
      );
    },
    [setSessions],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMembers();
      pushToast(
        "success",
        "Data disegarkan",
        "Data anggota berhasil dimuat ulang dari Supabase.",
      );
    } catch (error) {
      reportSupabaseError("Gagal mengambil data dari Supabase", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadMembers, pushToast, reportSupabaseError]);

  const registeredMember = useMemo(
    () => findMemberForAuth(members, auth),
    [members, auth],
  );
  const isRegistered = Boolean(registeredMember);

  const value = useMemo<AppContextValue>(
    () => ({
      auth,
      hydrated,
      login,
      registerAccount,
      logout,
      updateProfile,
      members,
      addMember,
      updateMember,
      deleteMember,
      registeredMember,
      isRegistered,
      sessions,
      createSession,
      deleteSession,
      setAttendance,
      online,
      refresh,
      refreshing,
      lastSyncedAt,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      auth,
      hydrated,
      login,
      registerAccount,
      logout,
      updateProfile,
      members,
      addMember,
      updateMember,
      deleteMember,
      registeredMember,
      isRegistered,
      sessions,
      createSession,
      deleteSession,
      setAttendance,
      online,
      refresh,
      refreshing,
      lastSyncedAt,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
