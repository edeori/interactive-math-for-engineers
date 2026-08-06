import { loadCurriculum, validateCurriculum } from "./index";

const curriculum = loadCurriculum();
const errors = validateCurriculum(curriculum);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Content valid: ${curriculum.modules.length} modules, ${curriculum.skills.length} skills, ${curriculum.lessons.length} lessons, ${curriculum.exercises.length} exercise templates.`,
  );
}
