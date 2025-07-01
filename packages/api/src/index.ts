import { CreateDepartmentDto } from 'departments/dto/create-department.dto';
import { UpdateDepartmentDto } from 'departments/dto/update-department.dto';
import { Department } from 'departments/entities/department.entity';
import { CreateEmployeeDto } from 'employees/dto/create-employee.dto';
import { UpdateEmployeeDto } from 'employees/dto/update-employee.dto';
import { Employee } from 'employees/entities/employee.entity';
import { CreateLinkDto } from 'links/dto/create-link.dto';
import { UpdateLinkDto } from 'links/dto/update-link.dto';
import { Link } from 'links/entities/link.entity';

export const links = {
  dto: {
    CreateLinkDto,
    UpdateLinkDto,
  },
  entities: {
    Link,
  },
};

export const employees = {
  dto: {
    CreateEmployeeDto,
    UpdateEmployeeDto,
  },
  entities: {
    Employee,
  },
};

export const departments = {
  dto: {
    CreateDepartmentDto,
    UpdateDepartmentDto,
  },
  entities: {
    Department,
  },
};
