"""Utilities for dynamic edge configuration validation and processing."""

from typing import List, Tuple

from entity.configs import Node, EdgeLink
from utils.exceptions import WorkflowExecutionError


def get_dynamic_config_for_node(node: Node) -> Tuple[bool, object]:
    """Get the dynamic configuration for a node from its incoming edges.
    
    Returns:
        Tuple of (found: bool, config: DynamicEdgeConfig or None)
    """
    from entity.configs.edge.dynamic_edge_config import DynamicEdgeConfig
    
    found_configs = []  # List of (source_node_id, dynamic_config)
    
    for predecessor in node.predecessors:
        for edge_link in predecessor.iter_outgoing_edges():
            if edge_link.target is node and edge_link.dynamic_config is not None:
                found_configs.append((predecessor.id, edge_link.dynamic_config))
    
    if not found_configs:
        return False, None
    
    if len(found_configs) == 1:
        return True, found_configs[0][1]
    
    # Multiple dynamic configs found - verify they are consistent
    first_source, first_config = found_configs[0]
    for source_id, config in found_configs[1:]:
        _validate_config_consistency(node.id, first_source, source_id, first_config, config)
    
    return True, first_config


def _validate_config_consistency(
    node_id: str,
    first_source: str,
    source_id: str,
    first_config,
    config
) -> None:
    """Validate that multiple dynamic configs are consistent."""
    # Check type consistency
    if config.type != first_config.type:
        raise WorkflowExecutionError(
            f"Node '{node_id}' has inconsistent dynamic configurations on incoming edges: "
            f"edge from '{first_source}' has type '{first_config.type}', "
            f"but edge from '{source_id}' has type '{config.type}'. "
            f"All dynamic edges to the same node must use the same configuration."
        )
    
    # Check split config consistency
    if (config.split.type != first_config.split.type or
        config.split.pattern != first_config.split.pattern or
        config.split.json_path != first_config.split.json_path):
        raise WorkflowExecutionError(
            f"Node '{node_id}' has inconsistent split configurations on incoming edges: "
            f"edges from '{first_source}' and '{source_id}' have different split settings. "
            f"All dynamic edges to the same node must use the same configuration."
        )
    
    # Check mode-specific config consistency
    if config.max_parallel != first_config.max_parallel:
        raise WorkflowExecutionError(
            f"Node '{node_id}' has inconsistent max_parallel on incoming edges: "
            f"edge from '{first_source}' has max_parallel={first_config.max_parallel}, "
            f"but edge from '{source_id}' has max_parallel={config.max_parallel}."
        )
    
    if config.type == "tree" and config.group_size != first_config.group_size:
        raise WorkflowExecutionError(
            f"Node '{node_id}' has inconsistent group_size on incoming edges: "
            f"edge from '{first_source}' has group_size={first_config.group_size}, "
            f"but edge from '{source_id}' has group_size={config.group_size}."
        )


def separate_dynamic_inputs(inputs: List) -> Tuple[List, List]:
    """Separate inputs into dynamic edge inputs and static inputs.
    
    Returns:
        Tuple of (dynamic_inputs, static_inputs)
    """
    dynamic_inputs = []
    static_inputs = []
    
    for msg in inputs:
        if msg.metadata.get("_from_dynamic_edge"):
            dynamic_inputs.append(msg)
        else:
            static_inputs.append(msg)
    
    return dynamic_inputs, static_inputs
