import { TestBed } from '@angular/core/testing';
import { ModulePlayerComponent } from './module-player.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormationsService } from '../../services/formations.service';
import { of } from 'rxjs';

describe('ModulePlayerComponent', () => {
    let component: ModulePlayerComponent;
    let fixture: any;
    let formationsService: jasmine.SpyObj<FormationsService>;

    beforeEach(async () => {
        const formationsServiceSpy = jasmine.createSpyObj('FormationsService', [
            'getFormationById',
            'getEnrolledFormations',
            'completeModuleText',
            'completeModuleVideo',
            'completeModuleLab',
            'submitModuleQuiz'
        ]);

        await TestBed.configureTestingModule({
            imports: [ModulePlayerComponent, RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: FormationsService, useValue: formationsServiceSpy }
            ]
        }).compileComponents();

        formationsService = TestBed.inject(FormationsService) as jasmine.SpyObj<FormationsService>;
        fixture = TestBed.createComponent(ModulePlayerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.formation).toBeNull();
        expect(component.module).toBeNull();
        expect(component.sidebarOpen).toBe(true);
        expect(component.aiChatOpen).toBe(false);
    });

    it('should toggle sidebar', () => {
        const initialState = component.sidebarOpen;
        component.toggleSidebar();
        expect(component.sidebarOpen).toBe(!initialState);
    });

    it('should toggle AI chat', () => {
        const initialState = component.aiChatOpen;
        component.toggleAIChat();
        expect(component.aiChatOpen).toBe(!initialState);
    });

    it('should initialize AI session on init', () => {
        component.ngOnInit();
        expect(component.aiSession).toBeTruthy();
        expect(component.aiSession?.messages.length).toBeGreaterThan(0);
        expect(component.aiSession?.messages[0].role).toBe('ai');
    });

    it('should check if module is fully completed correctly', () => {
        component.module = {
            id: 'test-module',
            formationId: 'test-formation',
            title: 'Test Module',
            order: 1,
            duration: 10
        } as any;

        component.moduleProgresses.set('test-module', {
            id: 'progress-1',
            enrollmentId: 'enrollment-1',
            moduleId: 'test-module',
            textCompleted: true,
            videoCompleted: true,
            labCompleted: true,
            quizCompleted: true,
            quizScore: 100,
            isModuleValidated: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        expect(component.isModuleFullyCompleted()).toBe(true);
    });

    it('should return false for non-completed module', () => {
        component.module = {
            id: 'test-module',
            formationId: 'test-formation',
            title: 'Test Module',
            order: 1,
            duration: 10
        } as any;

        component.moduleProgresses.set('test-module', {
            id: 'progress-2',
            enrollmentId: 'enrollment-1',
            moduleId: 'test-module',
            textCompleted: true,
            videoCompleted: false,
            labCompleted: false,
            quizCompleted: false,
            isModuleValidated: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        expect(component.isModuleFullyCompleted()).toBe(false);
    });

    it('should calculate module progress correctly', () => {
        const testModule = {
            id: 'test-module',
            formationId: 'test-formation',
            title: 'Test Module',
            order: 1,
            duration: 10
        } as any;

        component.moduleProgresses.set('test-module', {
            id: 'progress-3',
            enrollmentId: 'enrollment-1',
            moduleId: 'test-module',
            textCompleted: true,
            videoCompleted: true,
            labCompleted: false,
            quizCompleted: false,
            isModuleValidated: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const progress = component.getModuleProgress(testModule);
        expect(progress).toBe(50); // 2 out of 4 completed = 50%
    });
});
