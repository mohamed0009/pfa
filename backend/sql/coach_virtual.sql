-- ============================================================================
-- COACH AI PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Fichier SQL unique contenant toutes les tables nécessaires
-- Structure: Formation → Module → Cours → Contenus (Texte/Vidéo/Lab/Quiz)
-- Rôles: Apprenant (USER), Formateur (TRAINER), Admin (ADMIN)
-- ============================================================================
-- EXÉCUTION: Exécuter ce fichier après avoir créé la base: CREATE DATABASE coach_ai_db;
-- ============================================================================

-- Suppression des tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS trainer_validations CASCADE;
DROP TABLE IF EXISTS statistics CASCADE;
DROP TABLE IF EXISTS ai_recommendation_topics CASCADE;
DROP TABLE IF EXISTS ai_recommendation_target_students CASCADE;
DROP TABLE IF EXISTS ai_recommendation_based_on CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS course_certificates CASCADE;
DROP TABLE IF EXISTS formation_module_progress CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS formation_progress CASCADE;
DROP TABLE IF EXISTS formation_enrollments CASCADE;
DROP TABLE IF EXISTS ai_coach_messages CASCADE;
DROP TABLE IF EXISTS ai_coach_sessions CASCADE;
DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_options CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS submission_attachments CASCADE;
DROP TABLE IF EXISTS exercise_submissions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS lesson_resources CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS course_skills CASCADE;
DROP TABLE IF EXISTS course_objectives CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS module_progress CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS formations CASCADE;
DROP TABLE IF EXISTS chat_attachments CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS preferred_content_types CASCADE;
DROP TABLE IF EXISTS learning_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS AND AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    bio TEXT,
    validated_at TIMESTAMP,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'TRAINER', 'USER')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
    formation VARCHAR(255),
    niveau VARCHAR(50) CHECK (niveau IN ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE')),
    preferences_id VARCHAR(255),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    CONSTRAINT fk_user_preferences FOREIGN KEY (preferences_id) REFERENCES learning_preferences(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_status ON users(status);

-- ============================================================================
-- 2. LEARNING PREFERENCES
-- ============================================================================

CREATE TABLE learning_preferences (
    id VARCHAR(255) PRIMARY KEY,
    learning_pace VARCHAR(50) DEFAULT 'MODERE' CHECK (learning_pace IN ('LENT', 'MODERE', 'RAPIDE')),
    study_time_preference VARCHAR(50) DEFAULT 'APRES_MIDI' CHECK (study_time_preference IN ('MATIN', 'APRES_MIDI', 'SOIR', 'NUIT')),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    weekly_goal_hours INTEGER DEFAULT 10
);

CREATE TABLE preferred_content_types (
    preferences_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('VIDEO', 'TEXT', 'LAB', 'QUIZ')),
    PRIMARY KEY (preferences_id, content_type),
    CONSTRAINT fk_pref_content_types FOREIGN KEY (preferences_id) REFERENCES learning_preferences(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. FORMATIONS (Structure principale)
-- ============================================================================

CREATE TABLE formations (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    level VARCHAR(50) CHECK (level IN ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE')),
    category VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    duration DOUBLE PRECISION DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    completion_rate DOUBLE PRECISION DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    submitted_for_validation_at TIMESTAMP,
    validated_by VARCHAR(255),
    validated_at TIMESTAMP,
    rejection_reason TEXT,
    CONSTRAINT fk_formation_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_formation_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_formation_status ON formations(status);
CREATE INDEX idx_formation_created_by ON formations(created_by);
CREATE INDEX idx_formation_category ON formations(category);

CREATE TABLE formation_objectives (
    formation_id VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    PRIMARY KEY (formation_id, objective),
    CONSTRAINT fk_formation_objectives FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. MODULES (Appartiennent à une Formation)
-- ============================================================================

CREATE TABLE modules (
    id VARCHAR(255) PRIMARY KEY,
    formation_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    duration DOUBLE PRECISION DEFAULT 0,
    enrolled_students INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    submitted_for_validation_at TIMESTAMP,
    validated_by VARCHAR(255),
    validated_at TIMESTAMP,
    rejection_reason TEXT,
    CONSTRAINT fk_module_formation FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    CONSTRAINT fk_module_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_module_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_module_formation ON modules(formation_id);
CREATE INDEX idx_module_order ON modules(formation_id, module_order);

-- ============================================================================
-- 5. COURSES (Appartiennent à un Module)
-- ============================================================================

CREATE TABLE courses (
    id VARCHAR(255) PRIMARY KEY,
    module_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    long_description TEXT,
    instructor_name VARCHAR(255),
    instructor_title VARCHAR(255),
    instructor_avatar VARCHAR(500),
    thumbnail_url VARCHAR(500),
    preview_video_url VARCHAR(500),
    category VARCHAR(255),
    level VARCHAR(50) CHECK (level IN ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE')),
    language VARCHAR(50) DEFAULT 'Français',
    duration VARCHAR(255),
    estimated_hours DOUBLE PRECISION DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    price DOUBLE PRECISION DEFAULT 0,
    course_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    enrolled_students INTEGER DEFAULT 0,
    completion_rate DOUBLE PRECISION DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_certified BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    submitted_for_validation_at TIMESTAMP,
    validated_by VARCHAR(255),
    validated_at TIMESTAMP,
    rejection_reason TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_prompt TEXT,
    CONSTRAINT fk_course_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    CONSTRAINT fk_course_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_course_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_course_module ON courses(module_id);
CREATE INDEX idx_course_status ON courses(status);
CREATE INDEX idx_course_category ON courses(category);
CREATE INDEX idx_course_created_by ON courses(created_by);
CREATE INDEX idx_course_order ON courses(module_id, course_order);

CREATE TABLE course_skills (
    course_id VARCHAR(255) NOT NULL,
    skill VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, skill),
    CONSTRAINT fk_course_skills FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE course_objectives (
    course_id VARCHAR(255) NOT NULL,
    objective VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, objective),
    CONSTRAINT fk_course_objectives FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE course_prerequisites (
    course_id VARCHAR(255) NOT NULL,
    prerequisite VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, prerequisite),
    CONSTRAINT fk_course_prerequisites FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. LESSONS (Appartiennent à un Cours)
-- ============================================================================

CREATE TABLE lessons (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    lesson_number INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('VIDEO', 'TEXT', 'LAB', 'QUIZ')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 0,
    video_url VARCHAR(500),
    content_url VARCHAR(500),
    text_content TEXT,
    transcript TEXT,
    quiz_id VARCHAR(255),
    exercise_id VARCHAR(255),
    is_completed BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    lesson_order INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_lesson_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_lesson_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    CONSTRAINT fk_lesson_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
);

CREATE INDEX idx_lesson_course ON lessons(course_id);
CREATE INDEX idx_lesson_order ON lessons(course_id, lesson_order);

CREATE TABLE lesson_resources (
    id VARCHAR(255) PRIMARY KEY,
    lesson_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PDF', 'DOC', 'CODE', 'LINK')),
    url VARCHAR(500) NOT NULL,
    size VARCHAR(50),
    CONSTRAINT fk_lesson_resource_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX idx_lesson_resource_lesson ON lesson_resources(lesson_id);

CREATE TABLE course_resources (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PDF', 'VIDEO', 'LINK', 'DOCUMENT', 'IMAGE')),
    url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_course_resource_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_course_resource_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_course_resource_course ON course_resources(course_id);

-- ============================================================================
-- 7. EXERCISES (Lab/TP)
-- ============================================================================

CREATE TABLE exercises (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    difficulty VARCHAR(50) CHECK (difficulty IN ('FACILE', 'MOYEN', 'DIFFICILE')),
    estimated_time INTEGER DEFAULT 0,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PRATIQUE', 'SIMULATION', 'PROJET', 'CODE')),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_prompt TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_exercise_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_exercise_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_exercise_course ON exercises(course_id);

CREATE TABLE exercise_submissions (
    id VARCHAR(255) PRIMARY KEY,
    exercise_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWED', 'GRADED', 'VALIDATED')),
    feedback TEXT,
    score DOUBLE PRECISION,
    max_score DOUBLE PRECISION,
    graded_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_submission_exercise ON exercise_submissions(exercise_id);
CREATE INDEX idx_submission_user ON exercise_submissions(user_id);
CREATE INDEX idx_submission_status ON exercise_submissions(status);

CREATE TABLE submission_attachments (
    submission_id VARCHAR(255) NOT NULL,
    attachment_url VARCHAR(500) NOT NULL,
    PRIMARY KEY (submission_id, attachment_url),
    CONSTRAINT fk_submission_attachment FOREIGN KEY (submission_id) REFERENCES exercise_submissions(id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. QUIZZES (QCM)
-- ============================================================================

CREATE TABLE quizzes (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) CHECK (difficulty IN ('FACILE', 'MOYEN', 'DIFFICILE')),
    duration INTEGER DEFAULT 0,
    passing_score INTEGER DEFAULT 60,
    max_attempts INTEGER DEFAULT 3,
    is_graded BOOLEAN DEFAULT TRUE,
    available_after TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_prompt TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_quiz_course ON quizzes(course_id);

CREATE TABLE quiz_questions (
    id VARCHAR(255) PRIMARY KEY,
    quiz_id VARCHAR(255) NOT NULL,
    question_number INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'CODE')),
    question TEXT NOT NULL,
    explanation TEXT,
    points INTEGER NOT NULL DEFAULT 1,
    correct_answer TEXT,
    code_template TEXT,
    ai_hint_enabled BOOLEAN DEFAULT FALSE,
    question_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_quiz_question_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_question_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_question_order ON quiz_questions(quiz_id, question_order);

CREATE TABLE quiz_options (
    id VARCHAR(255) PRIMARY KEY,
    question_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_quiz_option_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_option_question ON quiz_options(question_id);

CREATE TABLE quiz_attempts (
    id VARCHAR(255) PRIMARY KEY,
    quiz_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    attempt_number INTEGER NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0,
    feedback TEXT,
    CONSTRAINT fk_quiz_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_attempt_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempt_user ON quiz_attempts(user_id);

CREATE TABLE quiz_answers (
    id VARCHAR(255) PRIMARY KEY,
    attempt_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned DOUBLE PRECISION NOT NULL DEFAULT 0,
    feedback TEXT,
    ai_explanation TEXT,
    CONSTRAINT fk_quiz_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_answer_attempt ON quiz_answers(attempt_id);
CREATE INDEX idx_quiz_answer_question ON quiz_answers(question_id);

-- ============================================================================
-- 9. INSCRIPTIONS
-- ============================================================================

-- Inscriptions aux formations (principale)
CREATE TABLE formation_enrollments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    formation_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'EN_COURS' CHECK (status IN ('EN_COURS', 'COMPLETED', 'DROPPED')),
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    target_completion_date TIMESTAMP,
    certificate_earned BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    CONSTRAINT fk_formation_enrollment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_formation_enrollment_formation FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_formation UNIQUE (user_id, formation_id)
);

CREATE INDEX idx_formation_enrollment_user ON formation_enrollments(user_id);
CREATE INDEX idx_formation_enrollment_formation ON formation_enrollments(formation_id);
CREATE INDEX idx_formation_enrollment_status ON formation_enrollments(status);

-- Inscriptions aux cours (optionnel, pour suivi détaillé)
CREATE TABLE enrollments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    target_completion_date TIMESTAMP,
    certificate_earned BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    CONSTRAINT fk_enrollment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollment_user ON enrollments(user_id);
CREATE INDEX idx_enrollment_course ON enrollments(course_id);
CREATE INDEX idx_enrollment_status ON enrollments(status);

-- ============================================================================
-- 10. PROGRESSION
-- ============================================================================

-- Progression globale par formation
CREATE TABLE formation_progress (
    id VARCHAR(255) PRIMARY KEY,
    enrollment_id VARCHAR(255) NOT NULL UNIQUE,
    overall_progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    completed_courses INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    completed_contents INTEGER DEFAULT 0,
    total_contents INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    average_quiz_score DOUBLE PRECISION DEFAULT 0,
    total_time_spent DOUBLE PRECISION DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP,
    CONSTRAINT fk_formation_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES formation_enrollments(id) ON DELETE CASCADE
);

CREATE INDEX idx_formation_progress_enrollment ON formation_progress(enrollment_id);

-- Progression par module dans une formation
CREATE TABLE formation_module_progress (
    id VARCHAR(255) PRIMARY KEY,
    progress_id VARCHAR(255) NOT NULL,
    module_id VARCHAR(255) NOT NULL,
    progress_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
    completed_courses INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    CONSTRAINT fk_formation_module_progress_progress FOREIGN KEY (progress_id) REFERENCES formation_progress(id) ON DELETE CASCADE,
    CONSTRAINT fk_formation_module_progress_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_formation_module_progress_progress ON formation_module_progress(progress_id);
CREATE INDEX idx_formation_module_progress_module ON formation_module_progress(module_id);

-- Progression par cours
CREATE TABLE course_progress (
    id VARCHAR(255) PRIMARY KEY,
    enrollment_id VARCHAR(255) NOT NULL UNIQUE,
    overall_progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    average_quiz_score DOUBLE PRECISION DEFAULT 0,
    total_time_spent DOUBLE PRECISION DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP,
    CONSTRAINT fk_course_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE INDEX idx_course_progress_enrollment ON course_progress(enrollment_id);

-- Progression par module dans un cours
CREATE TABLE module_progress (
    id VARCHAR(255) PRIMARY KEY,
    progress_id VARCHAR(255) NOT NULL,
    module_id VARCHAR(255) NOT NULL,
    progress_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    CONSTRAINT fk_module_progress_progress FOREIGN KEY (progress_id) REFERENCES course_progress(id) ON DELETE CASCADE,
    CONSTRAINT fk_module_progress_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE INDEX idx_module_progress_progress ON module_progress(progress_id);
CREATE INDEX idx_module_progress_module ON module_progress(module_id);

-- Progression par leçon
CREATE TABLE lesson_progress (
    id VARCHAR(255) PRIMARY KEY,
    enrollment_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    CONSTRAINT fk_lesson_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES formation_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT unique_enrollment_lesson UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- ============================================================================
-- 11. CERTIFICATS
-- ============================================================================

CREATE TABLE course_certificates (
    id VARCHAR(255) PRIMARY KEY,
    enrollment_id VARCHAR(255) NOT NULL UNIQUE,
    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score DOUBLE PRECISION,
    certificate_url VARCHAR(500) NOT NULL,
    verification_code VARCHAR(255) NOT NULL,
    CONSTRAINT fk_cert_enrollment FOREIGN KEY (enrollment_id) REFERENCES formation_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_course_cert_user ON course_certificates(user_id);
CREATE INDEX idx_course_cert_course ON course_certificates(course_id);

-- ============================================================================
-- 12. CHAT IA
-- ============================================================================

CREATE TABLE conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    last_message VARCHAR(500),
    last_message_date TIMESTAMP,
    messages_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversation_user ON conversations(user_id);
CREATE INDEX idx_conversation_active ON conversations(user_id, is_active);

CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('USER', 'AI')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'SUGGESTION', 'FEEDBACK')),
    CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_message_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_message_timestamp ON chat_messages(conversation_id, timestamp);

CREATE TABLE chat_attachments (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('LINK', 'DOCUMENT', 'EXERCISE', 'AUDIO')),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_chat_attachment_message FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_attachment_message ON chat_attachments(message_id);

-- ============================================================================
-- 13. AI COACH SESSIONS
-- ============================================================================

CREATE TABLE ai_coach_sessions (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ai_coach_session_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_coach_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_coach_session_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_coach_session_user ON ai_coach_sessions(user_id);
CREATE INDEX idx_ai_coach_session_course ON ai_coach_sessions(course_id);
CREATE INDEX idx_ai_coach_session_active ON ai_coach_sessions(user_id, is_active);

CREATE TABLE ai_coach_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'AI')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    context TEXT,
    audio_url VARCHAR(500),
    CONSTRAINT fk_ai_coach_message_session FOREIGN KEY (session_id) REFERENCES ai_coach_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_coach_message_session ON ai_coach_messages(session_id);
CREATE INDEX idx_ai_coach_message_timestamp ON ai_coach_messages(session_id, timestamp);

-- ============================================================================
-- 14. RECOMMANDATIONS IA
-- ============================================================================

CREATE TABLE ai_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('FORMATION', 'MODULE', 'QUIZ', 'LAB', 'RESOURCE')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    justification TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED')),
    student_count INTEGER,
    difficulty_detected VARCHAR(50),
    level VARCHAR(50),
    specialty VARCHAR(255),
    suggested_content TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_ai_recommendation_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_recommendation_status ON ai_recommendations(status);
CREATE INDEX idx_ai_recommendation_priority ON ai_recommendations(priority);
CREATE INDEX idx_ai_recommendation_created_at ON ai_recommendations(created_at DESC);

CREATE TABLE ai_recommendation_based_on (
    recommendation_id VARCHAR(255) NOT NULL,
    data_point TEXT NOT NULL,
    CONSTRAINT fk_ai_reco_based_on_recommendation FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_reco_based_on_recommendation ON ai_recommendation_based_on(recommendation_id);

CREATE TABLE ai_recommendation_target_students (
    recommendation_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    CONSTRAINT fk_ai_reco_target_recommendation FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_reco_target_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_reco_target_recommendation ON ai_recommendation_target_students(recommendation_id);
CREATE INDEX idx_ai_reco_target_student ON ai_recommendation_target_students(student_id);

CREATE TABLE ai_recommendation_topics (
    recommendation_id VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    message_count INTEGER DEFAULT 0,
    CONSTRAINT fk_ai_reco_topics_recommendation FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_reco_topics_recommendation ON ai_recommendation_topics(recommendation_id);

-- ============================================================================
-- 15. VALIDATIONS PAR LE FORMATEUR
-- ============================================================================

CREATE TABLE trainer_validations (
    id VARCHAR(255) PRIMARY KEY,
    recommendation_id VARCHAR(255) NOT NULL,
    trainer_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'MODIFIED')),
    comment TEXT,
    validated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trainer_validation_recommendation FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_trainer_validation_trainer FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trainer_validation_recommendation ON trainer_validations(recommendation_id);
CREATE INDEX idx_trainer_validation_trainer ON trainer_validations(trainer_id);
CREATE INDEX idx_trainer_validation_action ON trainer_validations(action);

-- ============================================================================
-- 16. NOTIFICATIONS
-- ============================================================================

CREATE TABLE user_notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ENROLLMENT', 'PROGRESS', 'RECOMMENDATION', 'VALIDATION', 'SYSTEM', 'ACHIEVEMENT')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_notification_user ON user_notifications(user_id);
CREATE INDEX idx_user_notification_read ON user_notifications(user_id, is_read);
CREATE INDEX idx_user_notification_created_at ON user_notifications(user_id, created_at DESC);

-- ============================================================================
-- 17. SUPPORT TICKETS
-- ============================================================================

CREATE TABLE support_tickets (
    id VARCHAR(255) PRIMARY KEY,
    ticket_number VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('TECHNIQUE', 'CONTENU', 'COMPTE', 'AUTRE')),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_RESPONSE', 'RESOLVED', 'CLOSED')),
    user_id VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_support_ticket_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_ticket_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_support_ticket_user ON support_tickets(user_id);
CREATE INDEX idx_support_ticket_status ON support_tickets(status);
CREATE INDEX idx_support_ticket_assigned_to ON support_tickets(assigned_to);

CREATE TABLE ticket_messages (
    id VARCHAR(255) PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_ticket_message_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_message_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_message_timestamp ON ticket_messages(ticket_id, timestamp);

-- ============================================================================
-- 18. STATISTIQUES
-- ============================================================================

CREATE TABLE statistics (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('GLOBAL', 'FORMATION', 'COURSE', 'TRAINER', 'STUDENT')),
    entity_id VARCHAR(255),
    metric_name VARCHAR(255) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

CREATE INDEX idx_statistics_type ON statistics(type);
CREATE INDEX idx_statistics_entity ON statistics(type, entity_id);
CREATE INDEX idx_statistics_calculated_at ON statistics(calculated_at DESC);

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================

