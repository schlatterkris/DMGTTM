# Lazy imports to avoid circular imports
def __getattr__(name):
    if name in ("WorkflowMetaInfo", "WorkflowRunResult", "run_workflow"):
        from runtime.sdk import WorkflowMetaInfo, WorkflowRunResult, run_workflow
        if name == "WorkflowMetaInfo":
            return WorkflowMetaInfo
        elif name == "WorkflowRunResult":
            return WorkflowRunResult
        elif name == "run_workflow":
            return run_workflow
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

__all__ = ["WorkflowMetaInfo", "WorkflowRunResult", "run_workflow"]
