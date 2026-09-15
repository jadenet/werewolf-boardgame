import { useEffect, useState } from "react";
import { Role } from "../../Interfaces";
import { fetchAllRoles } from "../helpers/getAllRoles";

// Loads the full role catalog (id, team, description, etc) for the in-lobby role editor.
export default function useRoleCatalog() {
  const [roleCatalog, setRoleCatalog] = useState<Role[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchAllRoles().then((fetchedRoles) => {
      if (!cancelled) {
        setRoleCatalog(fetchedRoles);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return roleCatalog;
}
