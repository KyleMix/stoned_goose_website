import { useEffect } from "react";

type JsonLdProps = {
  id: string;
  data: object;
};

export default function JsonLd({ id, data }: JsonLdProps) {
  useEffect(() => {
    const scriptId = `jsonld-${id}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, [id, data]);

  return null;
}
