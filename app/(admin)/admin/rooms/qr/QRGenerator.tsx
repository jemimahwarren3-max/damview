"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Database } from "@/types/database.types";
import {
  QrCode,
  Printer,
  ExternalLink,
  BedDouble,
  Armchair,
} from "lucide-react";

type Room = Database["public"]["Tables"]["rooms"]["Row"];
type Table = {
  id: string;
  table_number: number;
  capacity: number;
  status: string;
};

export default function QRGenerator({
  rooms,
  tables = [],
}: {
  rooms: Room[];
  tables?: Table[];
}) {
  const [activeTab, setActiveTab] = useState<"rooms" | "tables">("rooms");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://damviewresort.example";

  const handlePrintAll = () => window.print();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
          text: "text-emerald-700",
        };
      case "occupied":
        return {
          bg: "bg-neutral-50",
          border: "border-neutral-300",
          dot: "bg-neutral-800",
          text: "text-neutral-900",
        };
      case "cleaning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          dot: "bg-amber-500",
          text: "text-amber-700",
        };
      default:
        return {
          bg: "bg-neutral-50",
          border: "border-neutral-200",
          dot: "bg-neutral-500",
          text: "text-neutral-700",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <QrCode className="h-6 w-6 text-neutral-500" /> Room QR Codes
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Print and place these in each room for guest food ordering.
          </p>
        </div>
        <button
          onClick={handlePrintAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm"
          style={{ background: "#171717" }}
        >
          <Printer className="h-4 w-4" /> Print All QR Codes
        </button>
      </div>

      {/* Tabs */}
      {tables.length > 0 && (
        <div className="seg-group mb-6">
          <button
            onClick={() => setActiveTab("rooms")}
            data-active={activeTab === "rooms"}
            className="seg-item"
          >
            <BedDouble className="w-4 h-4" /> Room QRs
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            data-active={activeTab === "tables"}
            className="seg-item"
          >
            <Armchair className="w-4 h-4" /> Table QRs
          </button>
        </div>
      )}

      {activeTab === "rooms" && (
        <>
          {/* Stats */}
          <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="bg-neutral-100 p-2 rounded-xl">
                <QrCode className="h-4 w-4 text-neutral-900" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 font-semibold uppercase">
                  Total
                </span>
                <p className="font-semibold text-neutral-900">
                  {rooms.length} rooms
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div className="flex gap-4 flex-wrap text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {rooms.filter((r) => r.status === "available").length} available
              </span>
              <span className="flex items-center gap-1.5 text-neutral-900">
                <span className="w-2 h-2 rounded-full bg-neutral-800" />
                {rooms.filter((r) => r.status === "occupied").length} occupied
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {rooms.filter((r) => r.status === "cleaning").length} cleaning
              </span>
            </div>
          </div>

          {/* QR Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 stagger-children">
            {rooms.map((room) => {
              const sc = getStatusColor(room.status);
              return (
                <div
                  key={room.id}
                  className="glass-card overflow-hidden group transition-all duration-300"
                >
                  {/* Status bar */}
                  <div className={`h-1.5 ${sc.dot}`} />

                  <div className="p-5 flex flex-col items-center text-center">
                    {/* Room info */}
                    <div className="flex items-center gap-2 mb-1">
                      <BedDouble className="h-4 w-4 text-neutral-400" />
                      <h3 className="font-semibold text-lg text-neutral-900">
                        Room {room.room_number}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${sc.bg} ${sc.text} ${sc.border} border capitalize`}
                      >
                        {room.type}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${sc.bg} ${sc.text} ${sc.border} border`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {room.status}
                      </span>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-xl border-2 border-dashed border-neutral-200 group-hover:border-neutral-300 transition-colors shadow-inner">
                      <QRCodeSVG
                        value={`${baseUrl}/order/${room.room_number}`}
                        size={130}
                        level="H"
                        includeMargin={false}
                        fgColor="#262626"
                      />
                    </div>

                    {/* Scan label */}
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-3 mb-2">
                      Scan to order food
                    </p>

                    {/* Link */}
                    <a
                      href={`/order/${room.room_number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 hover:text-neutral-800 transition-colors bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-300"
                    >
                      Open Link <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Table QR Codes */}
      {activeTab === "tables" && tables.length > 0 && (
        <>
          <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-xl">
                <Armchair className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 font-semibold uppercase">
                  Total
                </span>
                <p className="font-semibold text-neutral-900">
                  {tables.length} tables
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 stagger-children">
            {tables.map((table) => (
              <div
                key={table.id}
                className="glass-card overflow-hidden group transition-all duration-300"
              >
                <div
                  className={`h-1.5 ${table.status === "occupied" ? "bg-amber-500" : "bg-emerald-500"}`}
                />
                <div className="p-5 flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <Armchair className="h-4 w-4 text-neutral-400" />
                    <h3 className="font-semibold text-lg text-neutral-900">
                      Table {table.table_number}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200">
                      {table.capacity} seats
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${table.status === "occupied" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${table.status === "occupied" ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      {table.status}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border-2 border-dashed border-neutral-200 group-hover:border-neutral-300 transition-colors shadow-inner">
                    <QRCodeSVG
                      value={`${baseUrl}/order/table/${table.table_number}`}
                      size={130}
                      level="H"
                      includeMargin={false}
                      fgColor="#262626"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-3 mb-2">
                    Scan to view menu
                  </p>
                  <a
                    href={`/order/table/${table.table_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 hover:text-neutral-800 transition-colors bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-300"
                  >
                    Open Menu <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
