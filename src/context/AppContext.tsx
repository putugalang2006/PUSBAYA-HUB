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
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  STORAGE_KEYS,
  TEMPEKAN_LIST,
} from "@/lib/constants";
import {
  findMemberForAuth,
  nextMemberSequence,
  memberCode,
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
  accounts: UserAccount[];
  login: (username: string, role: Role, password?: string) => LoginResult;
  registerAccount: (input: {
    username: string;
    password: string;
    photo?: string;
  }) => LoginResult;
  logout: () => void;

  members: Member[];
  addMember: (input: MemberInput) => Member | null;
  updateMember: (id: string, input: MemberInput) => void;
  deleteMember: (id: string) => void;
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
  refresh: () => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth, authHydrated] = useLocalStorageState<AuthUser | null>(
    STORAGE_KEYS.auth,
    null,
  );
  const [accounts, setAccounts, accountsHydrated] = useLocalStorageState<
    UserAccount[]
  >(STORAGE_KEYS.accounts, []);
  const [members, setMembers, membersHydrated] = useLocalStorageState<Member[]>(
    STORAGE_KEYS.members,
    [],
  );
  const [sessions, setSessions, sessionsHydrated] = useLocalStorageState<
    AttendanceSession[]
  >(STORAGE_KEYS.sessions, []);

  const hydrated =
    authHydrated &&
    accountsHydrated &&
    membersHydrated &&
    sessionsHydrated;

  const [online, setOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const registrationLock = useRef(false);

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

  useEffect(() => {
    setLastSyncedAt(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  // Invalidate sessions created before the username/password auth upgrade.
  useEffect(() => {
    if (!hydrated || !auth) return;
    if (typeof auth.username !== "string" || !auth.username) {
      setAuth(null);
    }
  }, [hydrated, auth, setAuth]);

  // Keep tabs in sync when another tab writes to localStorage.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === STORAGE_KEYS.accounts) {
        setAccounts(readStorage<UserAccount[]>(STORAGE_KEYS.accounts, []));
      }
      if (event.key === STORAGE_KEYS.members) {
        setMembers(readStorage<Member[]>(STORAGE_KEYS.members, []));
      }
      if (event.key === STORAGE_KEYS.sessions) {
        setSessions(readStorage<AttendanceSession[]>(STORAGE_KEYS.sessions, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setAccounts, setMembers, setSessions]);

  const login = useCallback(
    (username: string, role: Role, password?: string): LoginResult => {
      const identifier = username.trim();

      if (role === "ADMIN") {
        if (
          identifier.toLowerCase() !== ADMIN_USERNAME ||
          password !== ADMIN_PASSWORD
        ) {
          return {
            ok: false,
            error: "Username atau Password Admin salah!",
          };
        }
        setAuth({
          userId: "admin",
          username: ADMIN_USERNAME,
          name: "Admin PUSBAYA",
          role: "ADMIN",
          loginAt: new Date().toISOString(),
        });
        return { ok: true };
      }

      if (!identifier || !password) {
        return {
          ok: false,
          error: "Username dan password wajib diisi.",
        };
      }

      const account = accounts.find(
        (item) => item.username.toLowerCase() === identifier.toLowerCase(),
      );
      if (!account || account.password !== password) {
        return {
          ok: false,
          error: "Username atau password salah.",
        };
      }

      setAuth({
        userId: account.id,
        username: account.username,
        name: account.username,
        role: "PENGGUNA",
        photo: account.photo,
        loginAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [accounts, setAuth],
  );

  const registerAccount = useCallback(
    (input: {
      username: string;
      password: string;
      photo?: string;
    }): LoginResult => {
      const username = input.username.trim();
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
      const taken = accounts.some(
        (account) => account.username.toLowerCase() === username.toLowerCase(),
      );
      if (taken || username.toLowerCase() === ADMIN_USERNAME) {
        return {
          ok: false,
          error: "Username sudah digunakan. Pilih username lain.",
        };
      }

      const account: UserAccount = {
        id: uid("acc"),
        username,
        password: input.password,
        photo: input.photo,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, account]);
      setAuth({
        userId: account.id,
        username: account.username,
        name: account.username,
        role: "PENGGUNA",
        photo: account.photo,
        loginAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [accounts, setAccounts, setAuth],
  );

  const logout = useCallback(() => {
    setAuth(null);
    pushToast("info", "Anda telah keluar", "Sesi login berhasil diakhiri.");
  }, [setAuth, pushToast]);

  const addMember = useCallback(
    (input: MemberInput): Member | null => {
      const linkedMember = findMemberForAuth(members, auth);

      // Business rule: one user account may only register one member record.
      // The transient lock also blocks same-tick double submits before the
      // first state update has rendered.
      if (auth?.role === "PENGGUNA") {
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

      const linkedAccount =
        auth?.role === "PENGGUNA"
          ? accounts.find(
              (account) =>
                account.username.toLowerCase() ===
                auth.username.toLowerCase(),
            )
          : undefined;

      const now = new Date().toISOString();
      const member: Member = {
        id: memberCode(nextMemberSequence(members.map((m) => m.id))),
        userId:
          auth?.role === "PENGGUNA"
            ? (auth.userId ?? linkedAccount?.id ?? auth.username)
            : undefined,
        username:
          auth?.role === "PENGGUNA" ? auth.username : undefined,
        nama: input.nama.trim(),
        alamat: input.alamat.trim(),
        whatsapp: input.whatsapp.trim(),
        tempekan: TEMPEKAN_LIST.includes(input.tempekan)
          ? input.tempekan
          : TEMPEKAN_LIST[0],
        status: input.status,
        usia: input.usia,
        createdAt: now,
      };
      setMembers((prev) => [...prev, member]);
      return member;
    },
    [accounts, auth, members, pushToast, setMembers],
  );

  const updateMember = useCallback(
    (id: string, input: MemberInput) => {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                nama: input.nama.trim(),
                alamat: input.alamat.trim(),
                whatsapp: input.whatsapp.trim(),
                tempekan: input.tempekan,
                status: input.status,
                usia: input.usia,
              }
            : member,
        ),
      );
    },
    [setMembers],
  );

  const deleteMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((member) => member.id !== id));
      setSessions((prev) =>
        prev.map((session) => {
          if (!(id in session.records)) return session;
          const records = { ...session.records };
          delete records[id];
          return { ...session, records };
        }),
      );
    },
    [setMembers, setSessions],
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

  const refresh = useCallback(() => {
    setRefreshing(true);
    setMembers(readStorage<Member[]>(STORAGE_KEYS.members, []));
    setSessions(readStorage<AttendanceSession[]>(STORAGE_KEYS.sessions, []));
    window.setTimeout(() => {
      setRefreshing(false);
      setLastSyncedAt(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      pushToast("success", "Data disegarkan", "Sinkronisasi data lokal selesai.");
    }, 700);
  }, [setMembers, setSessions, pushToast]);

  const registeredMember = useMemo(
    () => findMemberForAuth(members, auth),
    [members, auth],
  );
  const isRegistered = Boolean(registeredMember);

  const value = useMemo<AppContextValue>(
    () => ({
      auth,
      hydrated,
      accounts,
      login,
      registerAccount,
      logout,
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
      accounts,
      login,
      registerAccount,
      logout,
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
