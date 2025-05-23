import React from 'react';
import Select from 'react-select';
import { Form } from 'react-bootstrap';

const JobRoleSelector = ({ onSelect }) => {
  // Predefined list of job roles
  const jobRoles = [
    { value: 'software_engineer', label: 'Software Engineer' },
    { value: 'data_analyst', label: 'Data Analyst' },
    { value: 'data_scientist', label: 'Data Scientist' },
    { value: 'business_analyst', label: 'Business Analyst' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'ux_designer', label: 'UX Designer' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'backend_developer', label: 'Backend Developer' },
    { value: 'fullstack_developer', label: 'Full Stack Developer' },
    { value: 'devops_engineer', label: 'DevOps Engineer' },
    { value: 'cloud_architect', label: 'Cloud Architect' },
    { value: 'machine_learning_engineer', label: 'Machine Learning Engineer' },
    { value: 'ai_researcher', label: 'AI Researcher' },
    { value: 'cybersecurity_analyst', label: 'Cybersecurity Analyst' },
    { value: 'network_engineer', label: 'Network Engineer' },
    { value: 'database_administrator', label: 'Database Administrator' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'qa_engineer', label: 'QA Engineer' },
    { value: 'technical_writer', label: 'Technical Writer' },
    { value: 'systems_analyst', label: 'Systems Analyst' },
  ];

  const handleChange = (selectedOptions) => {
    onSelect(selectedOptions || []);
  };

  return (
    <div>
      <Form.Group controlId="jobRoleSelect">
        <Form.Label>Select job roles you're interested in</Form.Label>
        <Select
          isMulti
          name="jobRoles"
          options={jobRoles}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Select job roles..."
          onChange={handleChange}
          aria-label="Job Role Selector"
        />
        <Form.Text className="text-muted">
          You can select multiple job roles to analyze your fit for each.
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default JobRoleSelector;