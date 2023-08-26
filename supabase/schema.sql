
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "user_id" "uuid"
);

ALTER TABLE "public"."questions" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."fetch_unanswered_questions"("team_id_param" integer) RETURNS SETOF "public"."questions"
    LANGUAGE "plpgsql"
    AS $$

DECLARE
  member1_uuid uuid;
  member2_uuid uuid;
  member3_uuid uuid;

BEGIN
  SELECT member1_id, member2_id, member3_id INTO member1_uuid, member2_uuid, member3_uuid
  FROM teams WHERE id = team_id_param;

  RETURN QUERY
  SELECT q.*
  FROM questions q
  LEFT JOIN answered_questions aq ON q.id = aq.question_id AND aq.team_id = team_id_param
  WHERE aq.question_id IS NULL AND (q.user_id != member1_uuid AND q.user_id != member2_uuid AND q.user_id != member3_uuid);
END;

$$;

ALTER FUNCTION "public"."fetch_unanswered_questions"("team_id_param" integer) OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."answered_questions" (
    "id" integer NOT NULL,
    "team_id" integer,
    "question_id" integer
);

ALTER TABLE "public"."answered_questions" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."answered_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."answered_questions_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."answered_questions_id_seq" OWNED BY "public"."answered_questions"."id";

CREATE SEQUENCE IF NOT EXISTS "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."questions_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";

CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" integer NOT NULL,
    "team_id" integer,
    "score" integer DEFAULT 0
);

ALTER TABLE "public"."scores" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."scores_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."scores_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."scores_id_seq" OWNED BY "public"."scores"."id";

CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "member1_id" "uuid",
    "member2_id" "uuid",
    "member3_id" "uuid"
);

ALTER TABLE "public"."teams" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."teams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."teams_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."teams_id_seq" OWNED BY "public"."teams"."id";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "team_id" integer
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE ONLY "public"."answered_questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."answered_questions_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."scores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."scores_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."teams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."teams_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."answered_questions"
    ADD CONSTRAINT "answered_questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."answered_questions"
    ADD CONSTRAINT "answered_questions_team_id_question_id_key" UNIQUE ("team_id", "question_id");

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."answered_questions"
    ADD CONSTRAINT "answered_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");

ALTER TABLE ONLY "public"."answered_questions"
    ADD CONSTRAINT "answered_questions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."scores"
    ADD CONSTRAINT "scores_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_member1_id_fkey" FOREIGN KEY ("member1_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_member2_id_fkey" FOREIGN KEY ("member2_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_member3_id_fkey" FOREIGN KEY ("member3_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";

GRANT ALL ON FUNCTION "public"."fetch_unanswered_questions"("team_id_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_unanswered_questions"("team_id_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_unanswered_questions"("team_id_param" integer) TO "service_role";

GRANT ALL ON TABLE "public"."answered_questions" TO "anon";
GRANT ALL ON TABLE "public"."answered_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."answered_questions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."answered_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."answered_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."answered_questions_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."scores" TO "anon";
GRANT ALL ON TABLE "public"."scores" TO "authenticated";
GRANT ALL ON TABLE "public"."scores" TO "service_role";

GRANT ALL ON SEQUENCE "public"."scores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."scores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."scores_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";

GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
