import {Button} from "@wakecap/core-ui/button";
import {FormControl, FormField} from "@wakecap/core-ui/form";
import {Input} from "@wakecap/core-ui/input";
import {useForm} from "react-hook-form";

export function CreateProjectForm() {
	const form = useForm({defaultValues: {name: "", description: ""}});
	return (
		<form onSubmit={form.handleSubmit(() => {})}>
			<FormField
				control={form.control}
				name="name"
				render={({field}) => (
					<FormControl>
						<Input {...field} />
					</FormControl>
				)}
			/>
			<Button type="submit">Create</Button>
		</form>
	);
}
