import { useEffect } from "react";

const usePageTitle = (pageTitle) => {
  useEffect(() => {
    const appName = "CT Text Tool";
    let documentTitle = appName;

    if (pageTitle) {
      documentTitle = `${pageTitle} - ${appName}`;
    }

    document.title = documentTitle;
  }, [pageTitle]);

  return null;
};

export default usePageTitle;
