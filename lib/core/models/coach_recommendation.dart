class CoachRecommendation {
  final String response;
  final String predictedDifficulty;
  final double confidence;
  final List<double> probabilities;
  final List<String> labels;
  final String source;

  const CoachRecommendation({
    required this.response,
    required this.predictedDifficulty,
    required this.confidence,
    this.probabilities = const [],
    this.labels = const [],
    required this.source,
  });

  factory CoachRecommendation.fromJson(Map<String, dynamic> json) {
    return CoachRecommendation(
      response: json['response']?.toString() ?? '',
      predictedDifficulty: json['predicted_difficulty']?.toString() ?? 'unknown',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      probabilities: (json['probabilities'] as List<dynamic>? ?? [])
          .map((value) => (value as num).toDouble())
          .toList(),
      labels: (json['labels'] as List<dynamic>? ?? [])
          .map((value) => value.toString())
          .toList(),
      source: json['source']?.toString() ?? 'unknown',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'response': response,
      'predicted_difficulty': predictedDifficulty,
      'confidence': confidence,
      'probabilities': probabilities,
      'labels': labels,
      'source': source,
    };
  }
}
