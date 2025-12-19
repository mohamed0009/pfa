import '../models/trainer_models.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/logger_service.dart';
import '../../../../core/di/dependency_injection.dart';

class TrainerService {
  final ApiService _apiService = getIt<ApiService>();
  final LoggerService _logger = getIt<LoggerService>();
  
  static const String _baseEndpoint = '/api/trainer';

  // Formations
  Future<List<TrainerFormation>> getFormations() async {
    try {
      _logger.logApiRequest('GET', '$_baseEndpoint/formations');
      final response = await _apiService.get<List<dynamic>>('$_baseEndpoint/formations');
      return response.map((json) => TrainerFormation.fromJson(json)).toList();
    } catch (e) {
      _logger.error('Failed to get formations', e);
      // Return empty list instead of throwing for better UX in "Lite" mode
      return [];
    }
  }

  Future<TrainerFormation> createFormation(Map<String, dynamic> data) async {
    try {
      _logger.logApiRequest('POST', '$_baseEndpoint/formations', data: data);
      final response = await _apiService.post<Map<String, dynamic>>('$_baseEndpoint/formations', data: data);
      return TrainerFormation.fromJson(response);
    } catch (e) {
      _logger.error('Failed to create formation', e);
      rethrow;
    }
  }

  // Modules
  Future<List<TrainerModule>> getModules(String formationId) async {
    try {
      _logger.logApiRequest('GET', '$_baseEndpoint/modules?formationId=$formationId');
      final response = await _apiService.get<List<dynamic>>('$_baseEndpoint/modules', queryParameters: {'formationId': formationId});
      return response.map((json) => TrainerModule.fromJson(json)).toList();
    } catch (e) {
      _logger.error('Failed to get modules', e);
      return [];
    }
  }

  Future<TrainerModule> createModule(Map<String, dynamic> data) async {
    try {
      _logger.logApiRequest('POST', '$_baseEndpoint/modules', data: data);
      final response = await _apiService.post<Map<String, dynamic>>('$_baseEndpoint/modules', data: data);
      return TrainerModule.fromJson(response);
    } catch (e) {
      _logger.error('Failed to create module', e);
      rethrow;
    }
  }

  // Courses
  Future<List<TrainerCourse>> getCourses(String moduleId) async {
    try {
      _logger.logApiRequest('GET', '$_baseEndpoint/courses?moduleId=$moduleId');
      final response = await _apiService.get<List<dynamic>>('$_baseEndpoint/courses', queryParameters: {'moduleId': moduleId});
      return response.map((json) => TrainerCourse.fromJson(json)).toList();
    } catch (e) {
      _logger.error('Failed to get courses', e);
      return [];
    }
  }

  Future<TrainerCourse> createCourse(Map<String, dynamic> data) async {
    try {
      _logger.logApiRequest('POST', '$_baseEndpoint/courses', data: data);
      final response = await _apiService.post<Map<String, dynamic>>('$_baseEndpoint/courses', data: data);
      return TrainerCourse.fromJson(response);
    } catch (e) {
      _logger.error('Failed to create course', e);
      rethrow;
    }
  }

  // Students
  Future<List<StudentDashboard>> getStudents() async {
    try {
      _logger.logApiRequest('GET', '$_baseEndpoint/students');
      final response = await _apiService.get<List<dynamic>>('$_baseEndpoint/students');
      return response.map((json) => StudentDashboard.fromJson(json)).toList();
    } catch (e) {
      _logger.error('Failed to get students', e);
      return [];
    }
  }

  Future<List<AtRiskStudent>> getAtRiskStudents() async {
    // Mock data parity with Web App
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      AtRiskStudent(
        studentId: 'student-1',
        studentName: 'Marie Dubois',
        formationId: 'form-1',
        riskLevel: 'high',
        reasons: ['Inactif depuis 7 jours', 'Progression faible (35%)'],
        progress: 35,
      ),
      AtRiskStudent(
        studentId: 'student-2',
        studentName: 'Pierre Martin',
        formationId: 'form-2',
        riskLevel: 'medium',
        reasons: ['Baisse de performance récente'],
        progress: 58,
      ),
    ];
  }
}

