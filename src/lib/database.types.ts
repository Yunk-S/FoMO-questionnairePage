import type { AnswerMap, DimensionScoreMap, FomoReport } from "@/lib/types";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      responses: {
        Row: {
          id: string;
          username: string;
          answers: AnswerMap;
          dimension_scores: DimensionScoreMap;
          total_score: number;
          report: FomoReport;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          answers: AnswerMap;
          dimension_scores: DimensionScoreMap;
          total_score: number;
          report: FomoReport;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["responses"]["Insert"]>;
        Relationships: [];
      };
      response_events: {
        Row: {
          id: string;
          response_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["response_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
