import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../../models/ai_models.dart';
import '../../services/ai_supervision_service.dart';

class KnowledgeBaseTab extends StatefulWidget {
  final VoidCallback? onStatsChanged;
  
  const KnowledgeBaseTab({super.key, this.onStatsChanged});

  @override
  State<KnowledgeBaseTab> createState() => _KnowledgeBaseTabState();
}

class _KnowledgeBaseTabState extends State<KnowledgeBaseTab> {
  final AISupervisionService _aiService = AISupervisionService();
  
  List<AIKnowledgeDocument> _documents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    setState(() => _isLoading = true);
    final documents = await _aiService.getKnowledgeDocuments();
    if (mounted) {
      setState(() {
        _documents = documents;
        _isLoading = false;
      });
    }
  }

  Future<void> _uploadDocument() async {
    // Simulate document upload
    final newDoc = AIKnowledgeDocument(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'Nouveau Document ${_documents.length + 1}',
      category: 'Général',
      fileType: 'pdf',
      fileSize: 1500000,
      status: DocumentStatus.processing,
      uploadedBy: 'Admin',
      uploadedAt: DateTime.now(),
    );

    await _aiService.uploadDocument(newDoc);
    await _loadDocuments();
    widget.onStatsChanged?.call();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Document uploadé et en cours d\'indexation'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    }
  }

  Future<void> _deleteDocument(AIKnowledgeDocument document) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer le document'),
        content: Text('Voulez-vous supprimer "${document.title}" de la base de connaissances ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.errorColor),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _aiService.deleteDocument(document.id);
      await _loadDocuments();
      widget.onStatsChanged?.call();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document supprimé avec succès'),
            backgroundColor: AppTheme.successColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header with Upload Button
        Container(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text(
                'Documents (${_documents.length})',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              FilledButton.icon(
                onPressed: _uploadDocument,
                icon: const Icon(Icons.upload_file),
                label: const Text('Uploader'),
                style: FilledButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        ),

        // Documents List
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _documents.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.library_books_outlined,
                            size: 64,
                            color: AppTheme.textSecondaryColor.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Aucun document',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppTheme.textSecondaryColor,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextButton.icon(
                            onPressed: _uploadDocument,
                            icon: const Icon(Icons.upload_file),
                            label: const Text('Uploader un document'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadDocuments,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _documents.length,
                        itemBuilder: (context, index) {
                          return _buildDocumentCard(_documents[index], index);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildDocumentCard(AIKnowledgeDocument document, int index) {
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // File Icon
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getFileIcon(document.fileType),
                    color: AppTheme.primaryColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 12),
                
                // Document Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        document.title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          _buildInfoChip(
                            document.category,
                            Icons.folder_outlined,
                          ),
                          const SizedBox(width: 8),
                          _buildInfoChip(
                            document.fileType.toUpperCase(),
                            Icons.description,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Delete Button
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  color: AppTheme.errorColor,
                  onPressed: () => _deleteDocument(document),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            // Metadata Row
            Row(
              children: [
                Icon(Icons.folder, size: 14, color: AppTheme.textSecondaryColor),
                const SizedBox(width: 4),
                Text(
                  '${document.fileSizeMB} MB',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(Icons.person, size: 14, color: AppTheme.textSecondaryColor),
                const SizedBox(width: 4),
                Text(
                  document.uploadedBy,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
                const SizedBox(width: 16),
                Icon(Icons.schedule, size: 14, color: AppTheme.textSecondaryColor),
                const SizedBox(width: 4),
                Text(
                  DateFormat('dd/MM/yy').format(document.uploadedAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            // Status Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getStatusColor(document.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _getStatusColor(document.status).withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _getStatusColor(document.status),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _getStatusLabel(document.status),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _getStatusColor(document.status),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (50 * index).ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildInfoChip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.backgroundSecondaryColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppTheme.textSecondaryColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getFileIcon(String fileType) {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'xls':
      case 'xlsx':
        return Icons.table_chart;
      case 'ppt':
      case 'pptx':
        return Icons.slideshow;
      default:
        return Icons.insert_drive_file;
    }
  }

  Color _getStatusColor(DocumentStatus status) {
    switch (status) {
      case DocumentStatus.active:
        return const Color(0xFF10b981);
      case DocumentStatus.processing:
        return const Color(0xFFf59e0b);
      case DocumentStatus.error:
        return const Color(0xFFdc2626);
    }
  }

  String _getStatusLabel(DocumentStatus status) {
    switch (status) {
      case DocumentStatus.active:
        return 'Actif';
      case DocumentStatus.processing:
        return 'Indexation...';
      case DocumentStatus.error:
        return 'Erreur';
    }
  }
}
