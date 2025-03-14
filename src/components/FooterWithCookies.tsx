
import { CookieSettingsButton } from "@/components/CookieManager";

const FooterWithCookies = () => {
  return (
    <div className="text-center p-4 border-t">
      <div className="flex justify-center mt-2">
        <CookieSettingsButton />
      </div>
    </div>
  );
};

export default FooterWithCookies;
