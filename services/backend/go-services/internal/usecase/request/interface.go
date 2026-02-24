package request

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UseCase defines the request use case interface
type UseCase interface {
	// Public user: submit and view own requests
	SubmitRequest(ctx context.Context, userID string, input *domain.SubmitRequestInput) (*domain.ProjectRequest, error)
	GetMyRequests(ctx context.Context, userID string) ([]*domain.ProjectRequest, error)
	GetRequestByID(ctx context.Context, id string) (*domain.ProjectRequest, error)

	// Admin: see everything + final approve
	GetAllRequests(ctx context.Context) ([]*domain.ProjectRequest, error)
	FinalApprove(ctx context.Context, adminID string, id string, input *domain.FinalApprovalInput) error

	// Program Chair: review, give feedback, assign to project head
	ProgramChairReview(ctx context.Context, chairID string, id string, input *domain.ProgramChairReviewInput) error
	AssignToHead(ctx context.Context, chairID string, id string, input *domain.AssignToHeadInput) error
	GetRequestsByProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error)

	// Project Head: view assigned (by department), respond, submit proposal
	GetRequestsForProjectHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error)
	GetRequestsByHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error)
	ProjectHeadRespond(ctx context.Context, headID string, id string, input *domain.ProjectHeadRespondInput) error
	SubmitProposal(ctx context.Context, headID string, id string, input *domain.SubmitProposalInput) error
	ReviewProposal(ctx context.Context, reviewerID string, id string, notes *string, approved bool) error

	// Program Chair / Admin: delete a request
	DeleteRequest(ctx context.Context, id string) error

	// Program Chair: view only their department's requests
	GetRequestsByDepartmentChair(ctx context.Context, chairID string) ([]*domain.ProjectRequest, error)

	// Program Chair: reroute a request to another department
	RerouteRequest(ctx context.Context, requestID, departmentID string) error
}
