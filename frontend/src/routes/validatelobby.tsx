import { Redirect, useParams } from "wouter";
import LobbiesId from "./lobbiesid";
import { useEffect, useState } from "react";
import { buildServerUrl } from "../app/config/server";

export default function ValidateLobby() {
    const [isValidId, setIsValidId] = useState(null);
    const params = useParams<{ id?: string }>();

    useEffect(() => {
      fetch(buildServerUrl(`/lobbies/${params.id}`)).then(async (result) => {
        const text = await result.text();
        setIsValidId(text === "true");
      });
    }, [params.id]);
    if (isValidId === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      );
    } else if (isValidId) {
      return <LobbiesId />;
    } else {
      return <Redirect to="/?invalidId=true" replace />;
    }
  }