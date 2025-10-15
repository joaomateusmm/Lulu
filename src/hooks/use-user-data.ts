import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

interface UseUserDataReturn {
  user: User | null;
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("barberfy_user_id");

      if (!userId) {
        // Se não há usuário logado, redirecionar para autenticação
        window.location.href = "/authentication";
        return;
      }

      const response = await fetch(`/api/user/${userId}/appointments`);
      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setAppointments(result.appointments);
      } else {
        setError(result.message || "Erro ao carregar dados");
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    user,
    appointments,
    loading,
    error,
    refreshData: loadUserData,
  };
}
