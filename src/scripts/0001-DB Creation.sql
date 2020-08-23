-- SEQUENCE: public.actions_actionid_seq

-- DROP SEQUENCE public.actions_actionid_seq;

CREATE SEQUENCE public.actions_actionid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.actionupdates_updateid_seq

-- DROP SEQUENCE public.actionupdates_updateid_seq;

CREATE SEQUENCE public.actionupdates_updateid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.boards_boardid_seq

-- DROP SEQUENCE public.boards_boardid_seq;

CREATE SEQUENCE public.boards_boardid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.cards_cardid_seq

-- DROP SEQUENCE public.cards_cardid_seq;

CREATE SEQUENCE public.cards_cardid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.columns_columnid_seq

-- DROP SEQUENCE public.columns_columnid_seq;

CREATE SEQUENCE public.columns_columnid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.combinedcards_combinedid_seq

-- DROP SEQUENCE public.combinedcards_combinedid_seq;

CREATE SEQUENCE public.combinedcards_combinedid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.teammembers_memberid_seq

-- DROP SEQUENCE public.teammembers_memberid_seq;

CREATE SEQUENCE public.teammembers_memberid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.teams_teamid_seq

-- DROP SEQUENCE public.teams_teamid_seq;

CREATE SEQUENCE public.teams_teamid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.templatecolumns_templatecolumnid_seq

-- DROP SEQUENCE public.templatecolumns_templatecolumnid_seq;

CREATE SEQUENCE public.templatecolumns_templatecolumnid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.templates_templateid_seq

-- DROP SEQUENCE public.templates_templateid_seq;

CREATE SEQUENCE public.templates_templateid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.users_userid_seq

-- DROP SEQUENCE public.users_userid_seq;

CREATE SEQUENCE public.users_userid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- SEQUENCE: public.votes_voteid_seq

-- DROP SEQUENCE public.votes_voteid_seq;

CREATE SEQUENCE public.votes_voteid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;




-- Table: public.templates

-- DROP TABLE public.templates;

CREATE TABLE public.templates
(
    templateid integer NOT NULL DEFAULT nextval('templates_templateid_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    instructions text COLLATE pg_catalog."default" NOT NULL,
    maxvotes integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT templates_pkey PRIMARY KEY (templateid)
)

TABLESPACE pg_default;

-- Table: public.templatecolumns

-- DROP TABLE public.templatecolumns;

CREATE TABLE public.templatecolumns
(
    templatecolumnid integer NOT NULL DEFAULT nextval('templatecolumns_templatecolumnid_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rank character varying(255) COLLATE pg_catalog."default" NOT NULL,
    templateid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT templatecolumns_pkey PRIMARY KEY (templatecolumnid),
    CONSTRAINT templatecolumns_template_templateid FOREIGN KEY (templateid)
        REFERENCES public.templates (templateid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_templatecolumns_template_templateid

-- DROP INDEX public.fki_templatecolumns_template_templateid;

CREATE INDEX fki_templatecolumns_template_templateid
    ON public.templatecolumns USING btree
    (templateid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
    userid integer NOT NULL DEFAULT nextval('users_userid_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    nickname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    resettoken character varying(64) COLLATE pg_catalog."default",
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (userid),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

-- Table: public.teams

-- DROP TABLE public.teams;

CREATE TABLE public.teams
(
    teamid integer NOT NULL DEFAULT nextval('teams_teamid_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    userid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT teams_pkey PRIMARY KEY (teamid),
    CONSTRAINT teams_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_teams_user_userid

-- DROP INDEX public.fki_teams_user_userid;

CREATE INDEX fki_teams_user_userid
    ON public.teams USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.teammembers

-- DROP TABLE public.teammembers;

CREATE TABLE public.teammembers
(
    memberid integer NOT NULL DEFAULT nextval('teammembers_memberid_seq'::regclass),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    teamid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT teammembers_pkey PRIMARY KEY (memberid),
    CONSTRAINT "team members_teams_teamid" FOREIGN KEY (teamid)
        REFERENCES public.teams (teamid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_team members_teams_teamid

-- DROP INDEX public."fki_team members_teams_teamid";

CREATE INDEX "fki_team members_teams_teamid"
    ON public.teammembers USING btree
    (teamid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.boards

-- DROP TABLE public.boards;

CREATE TABLE public.boards
(
    boardid integer NOT NULL DEFAULT nextval('boards_boardid_seq'::regclass),
    uuid uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    instructions text COLLATE pg_catalog."default" NOT NULL,
    maxvotes integer NOT NULL,
    private boolean NOT NULL DEFAULT false,
    showactions boolean NOT NULL DEFAULT false,
    allowvotes boolean NOT NULL DEFAULT false,
    showinstructions boolean NOT NULL DEFAULT false,
    locked boolean NOT NULL DEFAULT false,
    userid integer NOT NULL,
    teamid integer,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT boards_pkey PRIMARY KEY (boardid),
    CONSTRAINT boards_team_teamid FOREIGN KEY (teamid)
        REFERENCES public.teams (teamid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT boards_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_boards_team_teamid

-- DROP INDEX public.fki_boards_team_teamid;

CREATE INDEX fki_boards_team_teamid
    ON public.boards USING btree
    (teamid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_boards_user_userid

-- DROP INDEX public.fki_boards_user_userid;

CREATE INDEX fki_boards_user_userid
    ON public.boards USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.columns

-- DROP TABLE public.columns;

CREATE TABLE public.columns
(
    columnid integer NOT NULL DEFAULT nextval('columns_columnid_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rank character varying(255) COLLATE pg_catalog."default" NOT NULL,
    boardid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT columns_pkey PRIMARY KEY (columnid),
    CONSTRAINT columns_board_boardid FOREIGN KEY (boardid)
        REFERENCES public.boards (boardid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_columns_board_boardid

-- DROP INDEX public.fki_columns_board_boardid;

CREATE INDEX fki_columns_board_boardid
    ON public.columns USING btree
    (boardid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.actions

-- DROP TABLE public.actions;

CREATE TABLE public.actions
(
    actionid integer NOT NULL DEFAULT nextval('actions_actionid_seq'::regclass),
    text text COLLATE pg_catalog."default" NOT NULL,
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    due timestamp without time zone NOT NULL,
    closed timestamp without time zone NOT NULL,
    userid integer NOT NULL,
    boardid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT actions_pkey PRIMARY KEY (actionid),
    CONSTRAINT actions_board_boardid FOREIGN KEY (boardid)
        REFERENCES public.boards (boardid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT actions_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_actions_board_boardid

-- DROP INDEX public.fki_actions_board_boardid;

CREATE INDEX fki_actions_board_boardid
    ON public.actions USING btree
    (boardid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_actions_user_userid

-- DROP INDEX public.fki_actions_user_userid;

CREATE INDEX fki_actions_user_userid
    ON public.actions USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.actionupdates

-- DROP TABLE public.actionupdates;

CREATE TABLE public.actionupdates
(
    updateid integer NOT NULL DEFAULT nextval('actionupdates_updateid_seq'::regclass),
    update text COLLATE pg_catalog."default" NOT NULL,
    userid integer NOT NULL,
    actionid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT actionupdates_pkey PRIMARY KEY (updateid),
    CONSTRAINT actionupdates_action_actionid FOREIGN KEY (actionid)
        REFERENCES public.actions (actionid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT actionupdates_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_actionupdates_action_actionid

-- DROP INDEX public.fki_actionupdates_action_actionid;

CREATE INDEX fki_actionupdates_action_actionid
    ON public.actionupdates USING btree
    (actionid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_actionupdates_user_userid

-- DROP INDEX public.fki_actionupdates_user_userid;

CREATE INDEX fki_actionupdates_user_userid
    ON public.actionupdates USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;    

-- Table: public.cards

-- DROP TABLE public.cards;

CREATE TABLE public.cards
(
    cardid integer NOT NULL DEFAULT nextval('cards_cardid_seq'::regclass),
    text text COLLATE pg_catalog."default" NOT NULL,
    rank character varying(255) COLLATE pg_catalog."default" NOT NULL,
    colour character varying(7) COLLATE pg_catalog."default" NOT NULL,
    userid integer NOT NULL,
    columnid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT cards_pkey PRIMARY KEY (cardid),
    CONSTRAINT cards_column_columnid FOREIGN KEY (columnid)
        REFERENCES public.columns (columnid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT cards_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_cards_column_columnid

-- DROP INDEX public.fki_cards_column_columnid;

CREATE INDEX fki_cards_column_columnid
    ON public.cards USING btree
    (columnid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_cards_user_userid

-- DROP INDEX public.fki_cards_user_userid;

CREATE INDEX fki_cards_user_userid
    ON public.cards USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.votes

-- DROP TABLE public.votes;

CREATE TABLE public.votes
(
    voteid integer NOT NULL DEFAULT nextval('votes_voteid_seq'::regclass),
    userid integer NOT NULL,
    cardid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT votes_pkey PRIMARY KEY (voteid),
    CONSTRAINT votes_user_card_key UNIQUE (userid, cardid),
    CONSTRAINT votes_cards_cardid FOREIGN KEY (cardid)
        REFERENCES public.cards (cardid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT votes_users_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_votes_cards_cardid

-- DROP INDEX public.fki_votes_cards_cardid;

CREATE INDEX fki_votes_cards_cardid
    ON public.votes USING btree
    (cardid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_votes_users_userid

-- DROP INDEX public.fki_votes_users_userid;

CREATE INDEX fki_votes_users_userid
    ON public.votes USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.combinedcards

-- DROP TABLE public.combinedcards;

CREATE TABLE public.combinedcards
(
    combinedid integer NOT NULL DEFAULT nextval('combinedcards_combinedid_seq'::regclass),
    text text COLLATE pg_catalog."default" NOT NULL,
    colour character varying(7) COLLATE pg_catalog."default" NOT NULL,
    userid integer NOT NULL,
    cardid integer NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    CONSTRAINT combinedcards_pkey PRIMARY KEY (combinedid),
    CONSTRAINT combinedcards_card_cardid FOREIGN KEY (cardid)
        REFERENCES public.cards (cardid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT combinedcards_user_userid FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

-- Index: fki_combinedcards_card_cardid

-- DROP INDEX public.fki_combinedcards_card_cardid;

CREATE INDEX fki_combinedcards_card_cardid
    ON public.combinedcards USING btree
    (cardid ASC NULLS LAST)
    TABLESPACE pg_default;
-- Index: fki_combinedcards_user_userid

-- DROP INDEX public.fki_combinedcards_user_userid;

CREATE INDEX fki_combinedcards_user_userid
    ON public.combinedcards USING btree
    (userid ASC NULLS LAST)
    TABLESPACE pg_default;
