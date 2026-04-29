import { useEffect, useRef } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import { useGuestMode } from '../context/GuestModeContext';
import { guestStore } from '../lib/guestStore';

export default function GuestDataMigrator() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isGuestMode, exitGuestMode } = useGuestMode();
  const importGuestData = useMutation(api.migration.importGuestData);
  const navigate = useNavigate();
  const migrationStartedRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const wasAuth = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!isAuthenticated) {
      migrationStartedRef.current = false;
      return;
    }
    if (wasAuth) return;
    if (migrationStartedRef.current) return;

    if (!isGuestMode) return;

    if (!guestStore.hasData()) {
      exitGuestMode();
      return;
    }

    migrationStartedRef.current = true;
    const snapshot = guestStore.snapshot();

    const payload = {
      dashboards: snapshot.dashboards.map((d) => ({
        tempId: d._id as unknown as string,
        name: d.name,
        beforeTaxIncome: d.beforeTaxIncome,
        zipCode: d.zipCode,
        afterTaxIncome: d.afterTaxIncome,
      })),
      categories: snapshot.categories.map((c) => ({
        tempId: c._id as unknown as string,
        dashboardTempId: c.dashboardId as unknown as string,
        name: c.name,
        type: c.type,
        value: c.value,
        order: c.order,
      })),
      transactions: snapshot.transactions.map((t) => ({
        dashboardTempId: t.dashboardId as unknown as string,
        categoryTempId: t.categoryId as unknown as string | undefined,
        description: t.description,
        amount: t.amount,
        date: t.date,
        isPreTax: t.isPreTax,
      })),
    };

    importGuestData(payload)
      .then((firstId) => {
        exitGuestMode();
        navigate(firstId ? `/app/${firstId}` : '/app');
      })
      .catch((err) => {
        console.error('Failed to migrate guest data:', err);
        migrationStartedRef.current = false;
      });
  }, [isAuthenticated, isLoading, isGuestMode, exitGuestMode, importGuestData, navigate]);

  return null;
}
