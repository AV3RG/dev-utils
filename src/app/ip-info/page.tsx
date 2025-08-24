"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/shadcn/ui/input";
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";
import { AlertCircle, Globe, MapPin, Shield, Wifi } from "lucide-react";
import debounce from "lodash.debounce";
import ClickToCopy from "@/components/commons/ClickToCopy";

interface IPInfo {
  ip: string;
  isp: {
    asn: string;
    org: string;
    isp: string;
  };
  location: {
    country: string;
    country_code: string;
    city: string;
    state: string;
    zipcode: string;
    latitude: number;
    longitude: number;
    timezone: string;
    localtime: string;
  };
  risk: {
    is_mobile: boolean;
    is_vpn: boolean;
    is_tor: boolean;
    is_proxy: boolean;
    is_datacenter: boolean;
    risk_score: number;
  };
}

const IPInfoDisplay = ({ data }: { data: IPInfo }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Basic Information
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-medium text-foreground">{data.ip}</span>
            </div>
          </div>
        </div>

        {/* ISP Info */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">
              ISP Information
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ASN</span>
              <span className="font-medium text-foreground">
                {data.isp.asn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization</span>
              <span className="font-medium text-foreground">
                {data.isp.org}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISP</span>
              <span className="font-medium text-foreground">
                {data.isp.isp}
              </span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Location</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium text-foreground">
                {data.location.country} ({data.location.country_code})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span className="font-medium text-foreground">
                {data.location.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">State</span>
              <span className="font-medium text-foreground">
                {data.location.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium text-foreground">
                {data.location.timezone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local Time</span>
              <span className="font-medium text-foreground">
                {data.location.localtime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coordinates</span>
              <span className="font-medium text-foreground">
                {data.location.latitude}, {data.location.longitude}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Info */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">
              Risk Assessment
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Score</span>
              <span className="font-medium text-foreground">
                {data.risk.risk_score}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile</span>
              <span
                className={`font-medium ${
                  data.risk.is_mobile
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {data.risk.is_mobile ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VPN</span>
              <span
                className={`font-medium ${
                  data.risk.is_vpn ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {data.risk.is_vpn ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tor</span>
              <span
                className={`font-medium ${
                  data.risk.is_tor ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {data.risk.is_tor ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proxy</span>
              <span
                className={`font-medium ${
                  data.risk.is_proxy ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {data.risk.is_proxy ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Datacenter</span>
              <span
                className={`font-medium ${
                  data.risk.is_datacenter
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {data.risk.is_datacenter ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function IPInfo() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<IPInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidIP = (ip: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const fetchIPInfo = async (ip: string) => {
    if (!ip.trim()) {
      return { data: null, error: null };
    }
    try {
      const response = await fetch(`http://api.ipquery.io/${ip}`);
      if (!response.ok) {
        throw new Error("Failed to fetch IP information");
      }
      const data = await response.json();
      return { data, error: null };
    } catch (e) {
      console.error("Error while fetching IP info:", e);
      return {
        data: null,
        error:
          "Failed to fetch IP information. Please check your input and try again.",
      };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lookupIP = useCallback(
    debounce(async () => {
      if (!input.trim()) {
        setOutput(null);
        setError("");
        return;
      }

      if (!isValidIP(input)) {
        setError("Invalid IP address format");
        return;
      }

      setLoading(true);
      const { data, error } = await fetchIPInfo(input);
      setLoading(false);

      if (error) {
        setError(error);
        setOutput(null);
      } else {
        setOutput(data);
        setError("");
      }
    }, 500),
    [input]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  useEffect(() => {
    if (input) {
      lookupIP();
    }
  }, [input, lookupIP]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          IP Information Lookup
        </h1>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          {error && (
            <Alert
              variant="destructive"
              className={
                "p-2 flex items-center justify-center [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-2"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="ip-input"
            className="block text-sm font-medium text-foreground mb-2"
          >
            IP Address
          </label>
          <div className="flex items-center justify-between gap-2">
            <Input
              id="ip-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              className="w-96"
            />
            <div className="flex items-center gap-2">
              {output && (
                <ClickToCopy
                  toCopySupplier={() => {
                    return `${output.location.latitude}, ${output.location.longitude}`;
                  }}
                  buttonClassName="px-3"
                  iconOverride={<MapPin className="h-4 w-4" />}
                  buttonText="Copy Location"
                />
              )}
              {output && (
                <ClickToCopy
                  toCopySupplier={() => JSON.stringify(output, null, 2)}
                  buttonClassName="px-3"
                  buttonText="Copy JSON"
                />
              )}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-foreground mb-2">
            IP Information
          </h2>
          <div className="bg-muted p-4 rounded-md overflow-auto min-h-[300px] relative border border-border">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
              </div>
            ) : output ? (
              <>
                <IPInfoDisplay data={output} />
              </>
            ) : (
              <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                Enter an IP address to see its information
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
