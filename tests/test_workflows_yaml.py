"""Validate all workflow YAML files in yaml_instance/."""

from pathlib import Path

import pytest
import yaml

YAML_DIR = Path(__file__).parent.parent / "yaml_instance"


def _discover_yaml_files():
    return sorted(YAML_DIR.rglob("*.yaml")) + sorted(YAML_DIR.rglob("*.yml"))


YAML_FILES = _discover_yaml_files()


@pytest.mark.parametrize("yaml_path", YAML_FILES, ids=lambda p: str(p.relative_to(YAML_DIR)))
def test_yaml_parseable(yaml_path: Path):
    """Each YAML file must parse as valid yaml and have a mapping root."""
    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    assert isinstance(data, dict), f"{yaml_path.name}: root must be a mapping, got {type(data).__name__}"
    assert "graph" in data, f"{yaml_path.name}: missing required 'graph' section"


@pytest.mark.parametrize("yaml_path", YAML_FILES, ids=lambda p: str(p.relative_to(YAML_DIR)))
def test_yaml_full_validation(yaml_path: Path):
    """Each YAML must pass schema + structure + supported-type validation."""
    from check.check import check_config

    with open(yaml_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    err = check_config(data)
    assert not err, f"{yaml_path.relative_to(YAML_DIR)}:\n  {err}"
