from mlflow.entities._mlflow_object import _MlflowObject
from mlflow.protos.service_pb2 import RunState as ProtoRunState


def check_run_is_active(run_info):
    # if run_info.lifecycle_stage != LifecycleStage.ACTIVE:
    #     raise MlflowException( TODO check state to active
    #         f"The run {run_info.run_id} must be in 'active' lifecycle_stage.",
    #         error_code=INVALID_PARAMETER_VALUE,
    #     )
    return


class searchable_attribute(property):
    # Wrapper class over property to designate some of the properties as searchable
    # run attributes
    pass


class orderable_attribute(property):
    # Wrapper class over property to designate some of the properties as orderable
    # run attributes
    pass


class RunState(_MlflowObject):
    """
    Metadata about a state of the run.
    """

    def __init__(self, state_id, experiment_id, name):
        if experiment_id is None:
            raise Exception("experiment_id cannot be None")
        if state_id is None:
            raise Exception("state_id cannot be None")
        if name is None:
            raise Exception("name cannot be None")

        self._state_id = state_id
        self._experiment_id = experiment_id
        self._name = name

    def __eq__(self, other):
        if type(other) is type(self):
            # TODO deep equality here?
            return self.__dict__ == other.__dict__
        return False

    @property
    def state_id(self):
        """[Deprecated, use run_id instead] String containing run UUID."""
        return self._state_id

    @property
    def experiment_id(self):
        """String ID of the experiment for the current run."""
        return self._experiment_id

    @searchable_attribute
    def name(self):
        """String containing run name."""
        return self._name

    def to_proto(self):
        proto = ProtoRunState()
        proto.state_id = self.state_id
        proto.experiment_id = self.experiment_id
        proto.name = self.name
        return proto

    @classmethod
    def from_proto(cls, proto):
        return cls(state_id=proto.state_id, experiment_id=proto.experimdent_id, name=proto.name)

    @classmethod
    def from_dictionary(cls, the_dict):
        filtered_dict = {key: value for key, value in the_dict.items() if key in cls._properties()}
        return cls(**filtered_dict)
