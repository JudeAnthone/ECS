package request

import (
	"context"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type requestUseCase struct {
	requestRepo repository.RequestRepository
}

// NewRequestUseCase creates a new request use case.
func NewRequestUseCase(requestRepo repository.RequestRepository) UseCase {
	return &requestUseCase{requestRepo: requestRepo}
}

// SubmitRequest creates a brand-new extension service request.
func (uc *requestUseCase) SubmitRequest(ctx context.Context, userID string, input *domain.SubmitRequestInput) (*domain.ProjectRequest, error) {
	if input.RequestTitle == "" {
		return nil, fmt.Errorf("request_title is required")
	}
	if input.RequestDescription == "" {
		return nil, fmt.Errorf("request_description is required")
	}

	req := &domain.ProjectRequest{
		RequestTitle:        input.RequestTitle,
		RequestDescription:  input.RequestDescription,
		RequestedBy:         userID,
		RequestedDepartment: input.RequestedDepartment,
		EstimatedBudget:     input.EstimatedBudget,
		TargetBeneficiaries: input.TargetBeneficiaries,
		Justification:       input.Justification,
	}

	if err := uc.requestRepo.Create(ctx, req); err != nil {
		return nil, fmt.Errorf("failed to submit request: %w", err)
	}
	return req, nil
}

// GetMyRequests returns requests submitted by a specific user.
func (uc *requestUseCase) GetMyRequests(ctx context.Context, userID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByRequestedBy(ctx, userID)
}

// GetRequestByID returns a single request.
func (uc *requestUseCase) GetRequestByID(ctx context.Context, id string) (*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByID(ctx, id)
}

// GetAllRequests returns all requests (admin).
func (uc *requestUseCase) GetAllRequests(ctx context.Context) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetAll(ctx)
}

// ProgramChairReview submits the program chair's review.
func (uc *requestUseCase) ProgramChairReview(ctx context.Context, chairID, id string, input *domain.ProgramChairReviewInput) error {
	if input.Status != "approved" && input.Status != "rejected" {
		return fmt.Errorf("status must be 'approved' or 'rejected'")
	}
	return uc.requestRepo.ProgramChairReview(ctx, id, chairID, input)
}

// AssignToHead routes a request to a project head.
func (uc *requestUseCase) AssignToHead(ctx context.Context, chairID, id string, input *domain.AssignToHeadInput) error {
	if input.AssignedToProjectHead == "" {
		return fmt.Errorf("assigned_to_project_head is required")
	}
	return uc.requestRepo.AssignToHead(ctx, id, input)
}

// GetRequestsByProgram returns requests for a specific program.
func (uc *requestUseCase) GetRequestsByProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByAssignedProgram(ctx, programID)
}

// GetRequestsByHead returns requests assigned to a project head.
func (uc *requestUseCase) GetRequestsByHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByAssignedProjectHead(ctx, headID)
}

// ProjectHeadRespond records the project head's acceptance or rejection.
func (uc *requestUseCase) ProjectHeadRespond(ctx context.Context, headID, id string, input *domain.ProjectHeadRespondInput) error {
	if input.Response != "accepted" && input.Response != "declined" {
		return fmt.Errorf("response must be 'accepted' or 'declined'")
	}
	return uc.requestRepo.ProjectHeadRespond(ctx, id, input)
}

// SubmitProposal records the proposal document URL.
func (uc *requestUseCase) SubmitProposal(ctx context.Context, headID, id string, input *domain.SubmitProposalInput) error {
	if input.ProposalDocumentURL == "" {
		return fmt.Errorf("proposal_document_url is required")
	}
	return uc.requestRepo.SubmitProposal(ctx, id, input)
}

// ReviewProposal records the administrative review of a submitted proposal.
func (uc *requestUseCase) ReviewProposal(ctx context.Context, reviewerID, id string, notes *string, approved bool) error {
	return uc.requestRepo.ReviewProposal(ctx, id, reviewerID, notes, approved)
}

// FinalApprove records the admin's final approval or rejection.
func (uc *requestUseCase) FinalApprove(ctx context.Context, adminID, id string, input *domain.FinalApprovalInput) error {
	if input.Status != "approved" && input.Status != "rejected" {
		return fmt.Errorf("status must be 'approved' or 'rejected'")
	}
	return uc.requestRepo.FinalApprove(ctx, id, adminID, input)
}
