import {Button} from "@corensystem/core-ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@corensystem/core-ui/form";
import {Input} from "@corensystem/core-ui/input";
import {useForm} from "react-hook-form";

export function CreateProjectForm() {
	const form = useForm({defaultValues: {name: "", description: ""}});
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(() => {})}>
				<FormField
					control={form.control}
					name="name"
					rules={{required: "Name is required"}}
					render={({field}) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Create</Button>
			</form>
		</Form>
	);
}
