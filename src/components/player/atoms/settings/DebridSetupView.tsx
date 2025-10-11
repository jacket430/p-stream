import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Dropdown } from "@/components/form/Dropdown";
import { Menu } from "@/components/player/internals/ContextMenu";
import {
  StatusCircle,
  StatusCircleProps,
} from "@/components/player/internals/StatusCircle";
import { MwLink } from "@/components/text/Link";
import { AuthInputBox } from "@/components/text-inputs/AuthInputBox";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import {
  Status,
  testTorboxToken,
  testdebridToken,
} from "@/pages/parts/settings/SetupPart";

async function getdebridTokenStatus(
  debridToken: string | null,
  debridService: string,
) {
  if (debridToken) {
    const status: Status =
      debridService === "torbox"
        ? await testTorboxToken(debridToken)
        : await testdebridToken(debridToken);
    return status;
  }
  return "unset";
}

interface DebridSetupViewProps {
  id: string;
  debridToken: string | null;
  setdebridToken: (value: string | null) => void;
  debridService: string;
  setdebridService: (value: string) => void;
}

export function DebridSetupView({
  id,
  debridToken,
  setdebridToken,
  debridService,
  setdebridService,
}: DebridSetupViewProps) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const [status, setStatus] = useState<Status>("unset");
  const statusMap: Record<Status, StatusCircleProps["type"]> = {
    error: "error",
    success: "success",
    unset: "noresult",
    api_down: "error",
    invalid_token: "error",
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const result = await getdebridTokenStatus(debridToken, debridService);
      setStatus(result);
    };
    checkTokenStatus();
  }, [debridToken, debridService]);

  const handleReload = () => {
    window.location.reload();
  };

  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((status === "success" || status === "error") && alertRef.current) {
      alertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [status]);

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/source")}>
        Debrid Setup
      </Menu.BackLink>
      <Menu.Section className="pb-4">
        <div className="my-3">
          <p className="max-w-[30rem] font-medium">
            <Trans i18nKey="debrid.description">
              <MwLink to="https://real-debrid.com/" />
              {/* fifth's referral code */}
              <MwLink to="https://torbox.app/subscription?referral=3f665ece-0405-4012-9db7-c6f90e8567e1" />
            </Trans>
          </p>
          <p className="text-type-danger mt-2 max-w-[30rem]">
            {t("debrid.notice")}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-white font-bold mb-3">{t("debrid.tokenLabel")}</p>
          <div className="flex md:flex-row flex-col items-center w-full gap-4">
            <div className="flex items-center w-full">
              <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
              <AuthInputBox
                onChange={(newToken) => {
                  setdebridToken(newToken);
                }}
                value={debridToken ?? ""}
                placeholder="ABC123..."
                passwordToggleable
                className="flex-grow"
              />
            </div>
            <div className="flex items-center">
              <Dropdown
                options={[
                  {
                    id: "realdebrid",
                    name: t("debrid.serviceOptions.realdebrid"),
                  },
                  {
                    id: "torbox",
                    name: t("debrid.serviceOptions.torbox"),
                  },
                ]}
                selectedItem={{
                  id: debridService,
                  name: t(`debrid.serviceOptions.${debridService}`),
                }}
                setSelectedItem={(item) => setdebridService(item.id)}
                direction="up"
              />
            </div>
          </div>
          {status === "error" && (
            <p ref={alertRef} className="text-type-danger mt-4">
              {t("debrid.status.failure")}
            </p>
          )}
          {status === "api_down" && (
            <p ref={alertRef} className="text-type-danger mt-4">
              {t("debrid.status.api_down")}
            </p>
          )}
          {status === "invalid_token" && (
            <p ref={alertRef} className="text-type-danger mt-4">
              {t("debrid.status.invalid_token")}
            </p>
          )}
          {status === "success" && (
            <div ref={alertRef} className="mt-4">
              <Button theme="purple" onClick={handleReload}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </Menu.Section>
    </>
  );
}
