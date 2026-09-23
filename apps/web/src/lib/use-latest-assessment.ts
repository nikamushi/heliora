"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { AssessmentSummaryResponse } from "@/types/api";

export interface UseLatestAssessmentResult {
  isAuthorized: boolean;
  assessment: AssessmentSummaryResponse | null;
  isLoading: boolean;
  error: ApiClientError | null;
  refetch: () => Promise<void>;
  redirectToLogin: () => void;
}

/**
 * Consolidated hook for authenticated retrieval of latest assessment data.
 * Eliminates duplicate data fetching, error classification, and auth redirection
 * across dashboard and risk detail routes.
 */
export function useLatestAssessment(): UseLatestAssessmentResult {
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const [assessment, setAssessment] = useState<AssessmentSummaryResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.assessment.getLatest();
      setAssessment(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        setError(err);
      } else {
        setError(
          new ApiClientError(
            0,
            "Terjadi kendala saat memuat data asesmen kesehatan."
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    if (!isAuthorized) return;
    let isMounted = true;

    apiClient.assessment
      .getLatest()
      .then((data) => {
        if (!isMounted) return;
        setAssessment(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        if (err instanceof ApiClientError && err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        setError(
          err instanceof ApiClientError
            ? err
            : new ApiClientError(
                0,
                "Terjadi kendala saat memuat data asesmen kesehatan."
              )
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthorized, redirectToLogin]);

  return {
    isAuthorized,
    assessment,
    isLoading,
    error,
    refetch,
    redirectToLogin,
  };
}
